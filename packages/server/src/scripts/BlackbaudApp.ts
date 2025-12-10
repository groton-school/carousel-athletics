import { confirm, input } from '@inquirer/prompts';
import { Colors } from '@qui-cli/colors';
import { Validators } from '@qui-cli/validators';
import { options } from './DeployPlugin.js';

type Options = {
  hostname?: string;
  accessKey?: string;
  clientId?: string;
  clientSecret?: string;
};

export async function wizard({
  hostname,
  accessKey: access_key = undefined,
  clientId: client_id = undefined,
  clientSecret: client_secret = undefined
}: Options = {}) {
  const opt = options().opt;
  if (!opt) {
    throw new Error(`Expected opt to be defined.`);
  }

  access_key = await input({
    message: `${opt.accessKey.description} from ${Colors.url(
      'https://developer.blackbaud.com/subscriptions'
    )}`,
    validate: Validators.notEmpty,
    default: access_key
  });
  await confirm({
    message: `Create a new app at ${Colors.url('https://developer.blackbaud.com/apps')}`
  });
  client_id = await input({
    message: opt.clientId.description!,
    validate: Validators.notEmpty,
    default: client_id
  });
  client_secret = await input({
    message: opt.clientSecret.description!,
    validate: Validators.notEmpty,
    default: client_secret
  });
  const redirect_uri = `https://${hostname}/redirect`;
  await confirm({
    message: `Configure ${Colors.value(redirect_uri)} as the app's redirect URL`
  });
  await confirm({
    message: `Limit the SKY API scopes as described at ${Colors.url(
      'https://github.com/groton-school/blackbaud-to-google-group-sync/blob/main/docs/blackbaud-api-scope.md'
    )}`
  });
  return { access_key, client_id, client_secret, redirect_uri };
}
