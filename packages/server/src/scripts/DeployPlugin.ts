import gcloud from '@battis/partly-gcloudy';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env-1password';
import { Log } from '@qui-cli/log';
import * as Plugin from '@qui-cli/plugin';
import * as BlackbaudApp from './BlackbaudApp.js';

export type Configuration = Plugin.Configuration & {
  force?: boolean;
  name?: string;
  billing?: string;
  region?: string;
  supportEmail?: string;
  accessKey?: string;
  clientId?: string;
  clientSecret?: string;
};

export const name = 'deploy';

const config: Configuration = {
  name: 'Athletics'
};

export function configure(proposal: Configuration = {}) {
  for (const key in proposal) {
    if (key === 'force') {
      config.force = Plugin.hydrate(proposal.force, !process.env.PROJECT);
    } else {
      config[key] = Plugin.hydrate(proposal[key], config[key]);
    }
  }
}

export function options(): Plugin.Options {
  return {
    opt: {
      name: {
        description: 'Google Cloud project name',
        default: config.name
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
        description: `Blackbaud SKY API subscription access key (${Colors.url('https://developer.blackbaud.com/subscriptions')})`
      },
      clientId: {
        description: `Blackbaud SKY API app OAuth client ID (${Colors.url('https://developer.blackbaud.com/apps')})`
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

export async function init({
  values
}: Plugin.ExpectedArguments<typeof options>) {
  configure({
    region: await Env.get({ key: 'REGION' }),
    serviceAccount: await Env.get({ key: 'SERVICE_ACCOUNT' }),
    ...values
  });
}

export async function run() {
  if (config.force) {
    const result = await gcloud.batch.run.initialize({
      ...config,
      defaultName: 'Athletics'
    });
    config.region = result.region;
    config.serviceAccount = result.serviceAccount?.email;
  }
  try {
    const { service } = await gcloud.batch.run.deployService({
      serviceName: 'athletics',
      args: {
        ...gcloud.batch.run.DEFAULT_ARGS,
        source: './dist',
        'set-env-vars': `GOOGLE_CLOUD_PROJECT=${gcloud.projects.active.getIdentifier()}`,
        'allow-unauthenticated': true,
        max: 1
      },
      ...config
    });
    if (config.force) {
      const blackbaud = await BlackbaudApp.wizard({
        hostname: new URL(service.status.url).hostname,
        ...config
      });
      await gcloud.secrets.set({ name: 'BLACKBAUD', value: blackbaud });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    Log.error(Colors.error(`Deploy failed.`));
    process.exit(1);
  }
}
