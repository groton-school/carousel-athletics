import gcloud from '@battis/partly-gcloudy';
import { confirm, input } from '@inquirer/prompts';
import { Colors } from '@qui-cli/colors';
import { Core } from '@qui-cli/core';
import '@qui-cli/env';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import { Validators } from '@qui-cli/validators';
import path from 'node:path';

let setup = false;
let name = 'Carousel - Athletics';
let billing = undefined;
let region = undefined;
let supportEmail = undefined;
let accessKey = undefined;
let clientId = undefined;
let clientSecret = undefined;

function configure(config = {}) {
  setup = Plugin.hydrate(config.force, !process.env.PROJECT);
  name = Plugin.hydrate(config.name, name);
  billing = Plugin.hydrate(config.billing, billing);
  region = Plugin.hydrate(config.region, region);
  supportEmail = Plugin.hydrate(config.supportEmail, supportEmail);
  accessKey = Plugin.hydrate(config.accessKey, accessKey);
  clientId = Plugin.hydrate(config.clientId, clientId);
  clientSecret = Plugin.hydrate(config.clientSecret, clientSecret);
}

function options() {
  return {
    opt: {
      name: {
        description: 'Google Cloud project name',
        default: name
      },
      billing: {
        description: 'Google Cloud billing account ID for this project'
      },
      region: {
        description:
          'Google Cloud region in which to create App Engine instance'
      },
      supportEmail: {
        description: 'Support email address for app OAuth consent screen'
      },
      accessKey: {
        description: 'Blackbaud SKY API subscription access key',
        url: 'https://developer.blackbaud.com/subscriptions'
      },
      clientId: {
        description: 'Blackbaud SKY API app OAuth client ID',
        url: 'https://developer.blackbaud.com/apps'
      },
      clientSecret: {
        description: 'Blackbaud SKY API app OAuth client secret'
      }
    },
    flag: {
      force: {
        description: `Force run initial setup script (normally skipped if ${Colors.url('.env')} is configured)`,
        short: 'f'
      }
    }
  };
}

async function guideBlackbaudAppCreation({
  hostname,
  accessKey = undefined,
  clientId = undefined,
  clientSecret = undefined
}) {
  accessKey = await input({
    message: `${options().opt.accessKey.description} from ${Colors.url(
      'https://developer.blackbaud.com/subscriptions'
    )}`,
    validate: Validators.notEmpty,
    default: accessKey
  });
  await confirm({
    message: `Create a new app at ${Colors.url('https://developer.blackbaud.com/apps')}`
  });
  clientId = await input({
    message: options().opt.clientId.description,
    validate: Validators.notEmpty,
    default: clientId
  });
  clientSecret = await input({
    message: options().opt.clientSecret.description,
    validate: Validators.notEmpty,
    default: clientSecret
  });
  const redirectUrl = `https://${hostname}/redirect`;
  await confirm({
    message: `Configure ${Colors.value(redirectUrl)} as the app's redirect URL`
  });
  await confirm({
    message: `Limit the SKY API scopes as described at ${Colors.url(
      'https://github.com/groton-school/blackbaud-to-google-group-sync/blob/main/docs/blackbaud-api-scope.md'
    )}`
  });
  return { accessKey, clientId, clientSecret, redirectUrl };
}

function init(args) {
  configure(args.values);
}

async function run() {
  const { appEngine } = await gcloud.batch.appEngineDeployAndCleanup({
    retainVersions: 2
  });
  if (setup) {
    await gcloud.secrets.enableAppEngineAccess();
    const blackbaud = await guideBlackbaudAppCreation({
      hostname: appEngine.defaultHostname,
      accessKey,
      clientId,
      clientSecret
    });
    await gcloud.secrets.set({
      name: 'BLACKBAUD_ACCESS_KEY',
      value: blackbaud.accessKey
    });
    await gcloud.secrets.set({ name: 'BLACKBAUD_API_TOKEN', value: 'null' });
    await gcloud.secrets.set({
      name: 'BLACKBAUD_CLIENT_ID',
      value: blackbaud.clientId
    });
    await gcloud.secrets.set({
      name: 'BLACKBAUD_CLIENT_SECRET',
      value: blackbaud.clientSecret
    });
    await gcloud.secrets.set({
      name: 'BLACKBAUD_REDIRECT_URL',
      value: blackbaud.redirectUrl
    });

    Log.info(
      `Visit ${Colors.url(`https://${appEngine.defaultHostname}`)} to authorize ${name} to access Blackbaud APIs`
    );
  }
}

Root.configure({ root: path.dirname(import.meta.dirname) });
await Plugin.register({
  name: 'deploy',
  src: path.resolve(path.dirname(import.meta.dirname), 'src'),
  options,
  init,
  run
});
await Core.run();
