import type { Snowflake } from 'discord-api-types/v10';
import type Client from '../client/Client';
import type {
  ApplicationRoleConnection,
  ApplicationRoleConnectionEditData,
} from '../../typings';

interface APIApplicationRoleConnection {
  metadata?: Record<string, string>;
  platform_name?: string | null;
  platform_username?: string | null;
}

class OAuth2RoleConnection {
  readonly #client: Client;
  readonly #token: string;

  constructor(client: Client, token: string) {
    this.#client = client;
    this.#token = token;
  }

  #auth() {
    return {
      auth: false,
      headers: { Authorization: `Bearer ${this.#token}` },
    };
  }

  #map(data: APIApplicationRoleConnection): ApplicationRoleConnection {
    return {
      metadata: data.metadata ?? {},
      platformName: data.platform_name ?? null,
      platformUsername: data.platform_username ?? null,
    };
  }

  async fetch(applicationId: Snowflake): Promise<ApplicationRoleConnection> {
    const data = await this.#client.api.users['@me']
      .applications(applicationId)
      ['role-connection'].get<APIApplicationRoleConnection>(this.#auth());
    return this.#map(data);
  }

  async update(
    applicationId: Snowflake,
    data: ApplicationRoleConnectionEditData
  ): Promise<ApplicationRoleConnection> {
    const result = await this.#client.api.users['@me']
      .applications(applicationId)
      ['role-connection'].put<APIApplicationRoleConnection>({
        ...this.#auth(),
        data: {
          metadata: data.metadata,
          platform_name: data.platformName,
          platform_username: data.platformUsername,
        },
      });
    return this.#map(result);
  }

  async delete(applicationId: Snowflake): Promise<void> {
    await this.#client.api.users['@me']
      .applications(applicationId)
      ['role-connection'].delete(this.#auth());
  }
}

export default OAuth2RoleConnection;
export { OAuth2RoleConnection };
