import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const ENCODING = 'utf-8';
const client = new SecretManagerServiceClient();

export async function get<T = unknown>(name: string, version = 'latest') {
  let value: T | undefined = undefined;
  const [secret] = await client.accessSecretVersion({
    name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}/versions/${version}`
  });
  if (
    secret.payload?.data &&
    secret.payload !== null &&
    secret.payload.data !== null
  ) {
    value = JSON.parse(secret.payload.data.toString(ENCODING)) as T;
  }
  return value;
}

export async function set<T = unknown>(name: string, value: T) {
  await client.addSecretVersion({
    parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}`,
    payload: {
      data: Buffer.from(JSON.stringify(value), ENCODING)
    }
  });
}
