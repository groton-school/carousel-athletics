import { RequestHandler } from 'express';
import * as Client from 'openid-client';
import { Blockable } from '../Blockable.js';
import { SecretManager } from '../Google/index.js';

type TimeStampedTokens = Client.TokenEndpointResponse & { timestamp: number };

type Credentials = {
  access_key: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  tokens?: TimeStampedTokens;
};

export class SKY extends Blockable {
  private static readonly SECRET_NAME = 'BLACKBAUD';
  private static readonly REFRESH_TOKEN = `${SKY.name}.refreshToken`;
  private static instance?: SKY = undefined;

  private config: Promise<Client.Configuration>;
  private credentials: Promise<Credentials>;
  private code_verifier?: string;
  private state?: string;
  private tokens?: TimeStampedTokens = undefined;
  private secretManager = new SecretManager();

  private constructor() {
    super();
    this.credentials = this.getCredentials();
    this.config = new Promise((resolve) => {
      this.credentials.then((credentials) => {
        resolve(
          new Client.Configuration(
            {
              issuer: 'https://sky.blackbaud.com',
              authorization_endpoint:
                'https://app.blackbaud.com/oauth/authorize',
              token_endpoint: 'https://oauth2.sky.blackbaud.com/token'
            },
            credentials.client_id,
            credentials.client_secret
          )
        );
      });
    });
  }

  public static getInstance() {
    if (!SKY.instance) {
      SKY.instance = new SKY();
    }
    return SKY.instance;
  }

  private async getCredentials() {
    const credentials = await this.secretManager.get<Credentials>(
      SKY.SECRET_NAME
    );
    if (credentials) {
      return credentials;
    }
    throw new Error(`SKY API credentials not found`);
  }

  public async ready() {
    return (await this.getToken()) !== undefined;
  }

  public async getAuthorizeUrl() {
    this.code_verifier = Client.randomPKCECodeVerifier();
    const code_challenge: string = await Client.calculatePKCECodeChallenge(
      this.code_verifier
    );
    this.state = Client.randomState();

    const parameters: Record<string, string> = {
      redirect_uri: (await this.credentials).redirect_uri,
      code_challenge,
      code_challenge_method: 'S256',
      state: this.state
    };

    return Client.buildAuthorizationUrl(await this.config, parameters).href;
  }

  public async deauthorize() {
    await this.secretManager.set(SKY.SECRET_NAME, {
      ...(await this.credentials),
      tokens: undefined
    });
  }

  public handleRedirect: RequestHandler = async (req, res) => {
    this.saveTokens(
      await Client.authorizationCodeGrant(
        await this.config,
        new URL(req.url, (await this.credentials).redirect_uri),
        {
          pkceCodeVerifier: this.code_verifier,
          expectedState: this.state
        }
      )
    );
    res.redirect('/');
  };

  private async saveTokens(
    tokens: Client.TokenEndpointResponse
  ): Promise<TimeStampedTokens> {
    const timestampedTokens = {
      refresh_token: (await this.credentials).tokens?.refresh_token,
      ...tokens,
      timestamp: Date.now()
    };
    await this.secretManager.set(SKY.SECRET_NAME, {
      ...(await this.credentials),
      tokens: timestampedTokens
    });
    return timestampedTokens;
  }

  private async getToken() {
    if (this.tokens === undefined) {
      this.tokens = (await this.credentials).tokens;
    }
    if (this.tokens) {
      if (
        this.tokens.expires_in &&
        this.tokens.expires_in * 1000 + this.tokens.timestamp < Date.now()
      ) {
        if (this.isBlocked(SKY.REFRESH_TOKEN)) {
          await this.available(SKY.REFRESH_TOKEN);
          return this.tokens;
        } else {
          await this.acquire(SKY.REFRESH_TOKEN);
          if (this.tokens.refresh_token) {
            this.tokens = await this.saveTokens(
              await Client.refreshTokenGrant(
                await this.config,
                this.tokens.refresh_token
              )
            );
          } else {
            console.error('Token expired and no refresh token available');
            this.tokens = undefined;
            await this.secretManager.set(SKY.SECRET_NAME, {
              ...(await this.credentials),
              tokens: undefined
            });
          }
          this.release(SKY.REFRESH_TOKEN);
        }
      }
    } else {
      console.error(
        'Non-interactive request for tokens without prior authorization'
      );
    }
    return this.tokens;
  }

  public async fetch<T = unknown>(
    endpoint: string,
    { headers = {}, ...options }: RequestInit = {}
  ) {
    const tokens = await this.getToken();
    if (!tokens) {
      throw new Error('No token available');
    }
    headers = {
      ...headers,
      'Bb-Api-Subscription-Key': (await this.credentials).access_key,
      Authorization: `Bearer ${tokens.access_token}`
    };
    const url = new URL(endpoint, 'https://api.sky.blackbaud.com');
    const response = await fetch(url, { headers, ...options });
    const json = (await response.json()) as T;
    return json;
  }
}
