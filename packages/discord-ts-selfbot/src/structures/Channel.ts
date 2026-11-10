import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
import process from "node:process";
import Base from "./Base";
import type { Client } from "../client/Client";
import type { Guild } from "./Guild";
import type { RawChannelData } from "../../typings/rawDataTypes";
import ChannelFlags from "../util/ChannelFlags";
import _ConstantsModule from "../util/Constants";

const { ChannelTypes, ThreadChannelTypes, VoiceBasedChannelTypes } =
  _ConstantsModule;
import SnowflakeUtil from "../util/SnowflakeUtil";
import type { ChannelEntity } from "../types/entities/channel";
import type { PatchOf } from "../types/schema";
import type ClientType from "../client/Client";
import type ThreadChannelType from "./ThreadChannel";
import type { Snowflake } from "discord-api-types/v10";
import { isThreadParentChannel } from "../types/channels";

let CategoryChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let DMChannel: new (client: Client, data: RawChannelData) => Channel;
let NewsChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let StageChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let StoreChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let TextChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let ThreadChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => ThreadChannelType;
let VoiceChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let DirectoryChannel: new (client: Client, data: RawChannelData) => Channel;
let ForumChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;
let MediaChannel: new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;

/**
 * @type {WeakSet<Channel>}
 * @private
 * @internal
 */
const deletedChannels = new WeakSet();
let deprecationEmittedForDeleted = false;

function loadChannelClasses() {
  CategoryChannel ??= require("./CategoryChannel").default;
  DMChannel ??= require("./DMChannel").default;
  NewsChannel ??= require("./NewsChannel").default;
  StageChannel ??= require("./StageChannel").default;
  StoreChannel ??= require("./StoreChannel").default;
  TextChannel ??= require("./TextChannel").default;
  ThreadChannel ??= require("./ThreadChannel").default;
  VoiceChannel ??= require("./VoiceChannel").default;
  DirectoryChannel ??= require("./DirectoryChannel").default;
  ForumChannel ??= require("./ForumChannel").default;
  MediaChannel ??= require("./MediaChannel").default;
}

function cacheGuildChannel(cache: Map<Snowflake, unknown>, channel: Channel) {
  cache.set(channel.id, channel);
}

function requireGuild(guild: Guild | null | undefined): Guild {
  if (!guild) {
    throw new TypeError("A guild is required to create a guild channel");
  }
  return guild;
}

function createDirectMessageChannel(client: Client, data: RawChannelData) {
  let channel;
  if (
    ("recipients" in data &&
      data.recipients &&
      data.type !== ChannelTypes.GROUP_DM) ||
    data.type === ChannelTypes.DM
  ) {
    channel = new DMChannel(client, data);
  } else if (data.type === ChannelTypes.GROUP_DM) {
    const GroupDMChannel = require("./GroupDMChannel").default;
    channel = new GroupDMChannel(client, data);
  }
  return channel;
}

function createGuildChannel(
  client: Client,
  data: RawChannelData,
  guild: Guild | undefined,
  allowUnknownGuild: boolean
) {
  let channel;
  switch (data.type) {
    case ChannelTypes.GUILD_TEXT: {
      channel = new TextChannel(requireGuild(guild), data, client);
      break;
    }
    case ChannelTypes.GUILD_VOICE: {
      channel = new VoiceChannel(requireGuild(guild), data, client);
      break;
    }
    case ChannelTypes.GUILD_CATEGORY: {
      channel = new CategoryChannel(requireGuild(guild), data, client);
      break;
    }
    case ChannelTypes.GUILD_NEWS: {
      channel = new NewsChannel(requireGuild(guild), data, client);
      break;
    }
    case ChannelTypes.GUILD_STORE: {
      channel = new StoreChannel(requireGuild(guild), data, client);
      break;
    }
    case ChannelTypes.GUILD_STAGE_VOICE: {
      channel = new StageChannel(requireGuild(guild), data, client);
      break;
    }
    case ChannelTypes.GUILD_NEWS_THREAD:
    case ChannelTypes.GUILD_PUBLIC_THREAD:
    case ChannelTypes.GUILD_PRIVATE_THREAD: {
      const thread = new ThreadChannel(requireGuild(guild), data, client);
      if (
        !allowUnknownGuild &&
        thread.parent &&
        isThreadParentChannel(thread.parent)
      ) {
        thread.parent.threads.cache.set(thread.id, thread);
      }
      channel = thread;
      break;
    }

    case ChannelTypes.GUILD_DIRECTORY: {
      channel = new DirectoryChannel(client, data);
      break;
    }

    case ChannelTypes.GUILD_FORUM: {
      channel = new ForumChannel(requireGuild(guild), data, client);
      break;
    }

    case ChannelTypes.GUILD_MEDIA: {
      channel = new MediaChannel(requireGuild(guild), data, client);
      break;
    }

    default: {
      break;
    }
  }
  return channel;
}

class Channel extends Base implements ChannelEntity {
  declare id: ChannelEntity["id"];
  declare type: ChannelEntity["type"];
  declare flags: ChannelEntity["flags"];
  constructor(
    client: ClientType,
    data?: RawChannelData,
    immediatePatch = true
  ) {
    super(client);

    const type = data?.type === undefined ? undefined : ChannelTypes[data.type];
    this.type = type ?? "UNKNOWN";

    if (data && immediatePatch) {
      this._patch(data);
    }
  }

  _patch(data: PatchOf<"Channel">) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

    if ("flags" in data) {
      this.flags = new ChannelFlags(data.flags).freeze();
    } else {
      this.flags ??= new ChannelFlags().freeze();
    }
  }

  get createdTimestamp(): number | null {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt(): Date | null {
    const timestamp = this.createdTimestamp;
    return timestamp === null ? null : new Date(timestamp);
  }

  /**
   * Whether or not the structure has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        "Channel#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    return deletedChannels.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        "Channel#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    if (value) {
      deletedChannels.add(this);
    } else {
      deletedChannels.delete(this);
    }
  }

  get partial() {
    return false;
  }

  toString() {
    return `<#${this.id}>`;
  }

  async delete(_reason: string | null = null) {
    await this.client.api.channels(this.id).delete();
    return this;
  }

  fetch(force = true): Promise<Channel | null> {
    return this.client.channels.fetch(this.id, { force });
  }

  isText() {
    return "messages" in this;
  }

  isVoice() {
    return VoiceBasedChannelTypes.includes(this.type);
  }

  isThread() {
    return ThreadChannelTypes.includes(this.type);
  }

  isThreadOnly() {
    return "availableTags" in this;
  }

  isDirectory() {
    return this.type === "GUILD_DIRECTORY";
  }

  static create(
    client: Client,
    data: RawChannelData,
    guild?: Guild | null,
    { allowUnknownGuild = false }: { allowUnknownGuild?: boolean } = {}
  ) {
    loadChannelClasses();

    let channel;
    const guildId = "guild_id" in data ? data.guild_id : undefined;
    if (!guildId && !guild) {
      channel = createDirectMessageChannel(client, data);
    } else {
      const resolvedGuild =
        guild ?? (guildId ? client.guilds.cache.get(guildId) : undefined);

      if (resolvedGuild || allowUnknownGuild) {
        channel = createGuildChannel(
          client,
          data,
          resolvedGuild,
          allowUnknownGuild
        );
        if (channel && !allowUnknownGuild && resolvedGuild) {
          cacheGuildChannel(resolvedGuild.channels.cache, channel);
        }
      }
    }
    return channel;
  }

  toJSON(...props: unknown[]) {
    return super.toJSON({ createdTimestamp: true }, ...props);
  }
}

export { Channel, deletedChannels };
export default { Channel, deletedChannels };
