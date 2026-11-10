import { setTimeout } from "node:timers";
import Base from "./Base";
import _ConstantsModule from "../util/Constants";

const { Events } = _ConstantsModule;
import DataResolver from "../util/DataResolver";
import type {
  RawGuildTemplateData,
  RawGuildData,
} from "../../typings/rawDataTypes";
import type { GuildTemplateEntity } from "../types/entities/guild-template";
import type { PatchOf } from "../types/schema";
import type {
  Base64Resolvable,
  BufferResolvable,
  EditGuildTemplateOptions,
} from "../../typings";
import type { Guild } from "./Guild";
import type Client from "../client/Client";

class GuildTemplate extends Base implements GuildTemplateEntity {
  declare code: GuildTemplateEntity["code"];
  declare name: GuildTemplateEntity["name"];
  declare description: GuildTemplateEntity["description"];
  declare usageCount: GuildTemplateEntity["usageCount"];
  declare creator: GuildTemplateEntity["creator"];
  declare creatorId: GuildTemplateEntity["creatorId"];
  declare createdAt: GuildTemplateEntity["createdAt"];
  declare updatedAt: GuildTemplateEntity["updatedAt"];
  declare guildId: GuildTemplateEntity["guildId"];
  declare serializedGuild: GuildTemplateEntity["serializedGuild"];
  declare unSynced: GuildTemplateEntity["unSynced"];
  static GUILD_TEMPLATES_PATTERN = /./;
  constructor(client: Client, data: RawGuildTemplateData) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<"GuildTemplate">) {
    if ("code" in data) {
      this.code = data.code!;
    }

    if ("name" in data) {
      this.name = data.name!;
    }

    if ("description" in data) {
      this.description = data.description ?? null;
    }

    if ("usage_count" in data) {
      this.usageCount = data.usage_count!;
    }

    if ("creator_id" in data) {
      this.creatorId = data.creator_id!;
    }

    if ("creator" in data) {
      this.creator = this.client.users._add(data.creator);
    }

    if ("created_at" in data) {
      this.createdAt = new Date(data.created_at!);
    }

    if ("updated_at" in data) {
      this.updatedAt = new Date(data.updated_at!);
    }

    if ("source_guild_id" in data) {
      this.guildId = data.source_guild_id!;
    }

    if ("serialized_source_guild" in data) {
      this.serializedGuild = data.serialized_source_guild!;
    }

    this.unSynced = "is_dirty" in data ? Boolean(data.is_dirty) : null;

    return this;
  }

  async createGuild(
    name: string,
    icon?: BufferResolvable | Base64Resolvable
  ): Promise<Guild> {
    const { client } = this;
    const data: RawGuildData = await client.api.guilds
      .templates(this.code)
      .post({
        data: {
          icon: await DataResolver.resolveImage(icon),
          name,
        },
      });

    const existing = client.guilds.cache.get(data.id);
    if (existing) {
      return existing;
    }

    return new Promise<Guild>((resolve) => {
      const resolveGuild = (guild: Guild) => {
        client.off(Events.GUILD_CREATE, handleGuild);
        client.decrementMaxListeners();
        resolve(guild);
      };

      const handleGuild = (guild: Guild) => {
        if (guild.id === data.id) {
          clearTimeout(timeout);
          resolveGuild(guild);
        }
      };

      client.incrementMaxListeners();
      client.on(Events.GUILD_CREATE, handleGuild);

      const timeout = setTimeout(
        () => resolveGuild(client.guilds._add(data)),
        10_000
      ).unref();
    });
  }

  async edit({ name, description }: EditGuildTemplateOptions = {}) {
    const data = await this.client.api
      .guilds(this.guildId)
      .templates(this.code)
      .patch<RawGuildTemplateData>({
        data: { description, name },
      });
    return this._patch(data);
  }

  async delete() {
    await this.client.api.guilds(this.guildId).templates(this.code).delete();
    return this;
  }

  async sync() {
    const data = await this.client.api
      .guilds(this.guildId)
      .templates(this.code)
      .put<RawGuildTemplateData>();
    return this._patch(data);
  }

  get createdTimestamp() {
    return this.createdAt.getTime();
  }

  get updatedTimestamp() {
    return this.updatedAt.getTime();
  }

  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }

  get url() {
    return `${this.client.options.http.template}/${this.code}`;
  }

  toString() {
    return this.code;
  }
}

GuildTemplate.GUILD_TEMPLATES_PATTERN =
  /discord(?:app)?\.(?:com\/template|new)\/([\w-]{2,255})/gi;

export default GuildTemplate;
export { GuildTemplate };
