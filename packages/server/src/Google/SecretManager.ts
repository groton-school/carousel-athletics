import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Blockable } from '../Blockable.js';

export class SecretManager extends Blockable {
  private static readonly ENCODING = 'utf-8';
  private static readonly ACCESSOR = `${SecretManager.name}.accessor`;

  private readonly client = new SecretManagerServiceClient();

  public async get<T = unknown>(name: string, version = 'latest') {
    await this.acquire(SecretManager.ACCESSOR);
    let value: T | undefined = undefined;
    const [secret] = await this.client.accessSecretVersion({
      name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}/versions/${version}`
    });
    if (
      secret.payload?.data &&
      secret.payload !== null &&
      secret.payload.data !== null
    ) {
      value = JSON.parse(
        secret.payload.data.toString(SecretManager.ENCODING)
      ) as T;
    }
    this.release(SecretManager.ACCESSOR);
    return value;
  }

  public async set<T = unknown>(name: string, value: T) {
    await this.acquire(SecretManager.ACCESSOR);
    const parent = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}`;
    const [latest] = await this.client.addSecretVersion({
      parent,
      payload: {
        data: Buffer.from(JSON.stringify(value), SecretManager.ENCODING)
      }
    });
    const [versions] = await this.client.listSecretVersions({ parent });
    for (const version of versions) {
      if (version !== latest) {
        await this.client.destroySecretVersion({
          name: `${parent}/version/${version}`
        });
      }
    }
    this.release(SecretManager.ACCESSOR);
  }
}
