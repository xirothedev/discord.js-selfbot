import Base from "./Base";
import IntegrationApplication from "./IntegrationApplication";
import type { Role } from "./Role";
import type { RawIntegrationData } from "../../typings/rawDataTypes";
import type { IntegrationEntity } from "../types/entities/integration";
import type { PatchOf } from "../types/schema";
import type Client from "../client/Client";
import type { Guild } from "./Guild";

class Integration extends Base implements IntegrationEntity {
  declare account: IntegrationEntity["account"];
  declare application: IntegrationEntity["application"];
  declare enabled: IntegrationEntity["enabled"];
  declare expireBehavior: IntegrationEntity["expireBehavior"];
  declare expireGracePeriod: IntegrationEntity["expireGracePeriod"];
  declare guild: IntegrationEntity["guild"];
  declare id: IntegrationEntity["id"];
  declare name: IntegrationEntity["name"];
  declare role: IntegrationEntity["role"];
  declare enableEmoticons: IntegrationEntity["enableEmoticons"];
  declare syncedAt: IntegrationEntity["syncedAt"];
  declare syncing: IntegrationEntity["syncing"];
  declare type: IntegrationEntity["type"];
  declare user: IntegrationEntity["user"];
  declare subscriberCount: IntegrationEntity["subscriberCount"];
  declare revoked: IntegrationEntity["revoked"];
  constructor(client: Client, data: RawIntegrationData, guild: Guild) {
    super(client);

    this.guild = guild;

    this.id = data.id;

    this.name = data.name;

    this.type = data.type;

    this.enabled = data.enabled;

    this.syncing = data.syncing;

    this.role = data.role_id
      ? this.guild.roles.cache.get(data.role_id)
      : undefined;

    if ("enable_emoticons" in data) {
      this.enableEmoticons = data.enable_emoticons ?? null;
    } else {
      this.enableEmoticons ??= null;
    }

    this.user = data.user ? this.client.users._add(data.user) : null;

    this.account = data.account;

    this.syncedAt = data.synced_at ? Date.parse(data.synced_at) : undefined;

    if ("subscriber_count" in data) {
      this.subscriberCount = data.subscriber_count ?? null;
    } else {
      this.subscriberCount ??= null;
    }

    if ("revoked" in data) {
      this.revoked = data.revoked ?? null;
    } else {
      this.revoked ??= null;
    }

    this._patch(data);
  }

  get roles() {
    const roles = this.guild.roles.cache;
    return roles.filter((role: Role) => role.tags?.integrationId === this.id);
  }

  _patch(data: PatchOf<"Integration">) {
    if ("expire_behavior" in data) {
      this.expireBehavior = data.expire_behavior;
    }

    if ("expire_grace_period" in data) {
      this.expireGracePeriod = data.expire_grace_period;
    }

    if ("application" in data) {
      if (this.application && data.application) {
        this.application._patch(data.application);
      } else {
        this.application = new IntegrationApplication(
          this.client,
          data.application
        );
      }
    } else {
      this.application ??= null;
    }
  }

  async delete(reason?: string) {
    await this.client.api
      .guilds(this.guild.id)
      .integrations(this.id)
      .delete({ reason });
    return this;
  }

  toJSON() {
    return super.toJSON({
      guild: "guildId",
      role: "roleId",
      user: "userId",
    });
  }
}

export default Integration;
export { Integration };
