import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Mutex } from 'async-mutex';

const ENCODING = 'utf-8';
const client = new SecretManagerServiceClient();
const mutex = new Mutex();

export async function get<T = unknown>(name: string, version = 'latest') {
  return await mutex.runExclusive(async () => {
    const [secret] = await client.accessSecretVersion({
      name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}/versions/${version}`
    });
    if (
      secret.payload?.data &&
      secret.payload !== null &&
      secret.payload.data !== null
    ) {
      return JSON.parse(secret.payload.data.toString(ENCODING)) as T;
    }
    return undefined;
  });
}

export async function set<T = unknown>(name: string, value: T) {
  await mutex.runExclusive(async () => {
    await client.addSecretVersion({
      parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}`,
      payload: {
        data: Buffer.from(JSON.stringify(value), ENCODING)
      }
    });
  });
}
