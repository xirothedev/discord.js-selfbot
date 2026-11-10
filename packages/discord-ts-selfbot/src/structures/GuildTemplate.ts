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
  static GUILD_TEMPLATES_PATTERN = /./u;
  constructor(client: Client, data: RawGuildTemplateData) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<"GuildTemplate">) {
    this.code = data.code ?? this.code;
    this.name = data.name ?? this.name;

    if ("description" in data) {
      this.description = data.description ?? null;
    }

    this.usageCount = data.usage_count ?? this.usageCount;
    this.creatorId = data.creator_id ?? this.creatorId;

    if ("creator" in data) {
      this.creator = this.client.users._add(data.creator);
    }

    if (data.created_at !== undefined) {
      this.createdAt = new Date(data.created_at);
    }

    if (data.updated_at !== undefined) {
      this.updatedAt = new Date(data.updated_at);
    }

    this.guildId = data.source_guild_id ?? this.guildId;
    this.serializedGuild = data.serialized_source_guild ?? this.serializedGuild;

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

    const { promise, resolve } = Promise.withResolvers<Guild>();
    const state: {
      handleGuild: (guild: Guild) => void;
      timeout?: NodeJS.Timeout;
    } = { handleGuild: () => null };
    const resolveGuild = (guild: Guild) => {
      if (state.timeout) {
        clearTimeout(state.timeout);
      }
      client.off(Events.GUILD_CREATE, state.handleGuild);
      client.decrementMaxListeners();
      resolve(guild);
    };

    state.handleGuild = (guild: Guild) => {
      if (guild.id === data.id) {
        resolveGuild(guild);
      }
    };

    client.incrementMaxListeners();
    client.on(Events.GUILD_CREATE, state.handleGuild);

    state.timeout = setTimeout(
      () => resolveGuild(client.guilds._add(data)),
      10_000
    ).unref();

    return promise;
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
  /discord(?:app)?\.(?:com\/template|new)\/(?<code>[\w-]{2,255})/giu;

export default GuildTemplate;
export { GuildTemplate };
