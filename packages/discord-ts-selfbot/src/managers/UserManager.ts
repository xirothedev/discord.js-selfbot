import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import _GuildMemberModule from "../structures/GuildMember";

const { GuildMember } = _GuildMemberModule;
import _MessageModule from "../structures/Message";

const { Message } = _MessageModule;
import ThreadMember from "../structures/ThreadMember";
import User from "../structures/User";
import { isDMChannel } from "../types/channels";
import type { Snowflake } from "discord-api-types/v10";
import type { BaseFetchOptions, UserResolvable } from "../../typings";
import type { Client } from "../client/Client";
import type { DMChannel } from "../structures/DMChannel";
import type { SendOptions } from "../types/channels";

type UserResolvableSource =
  | User
  | InstanceType<typeof GuildMember>
  | InstanceType<typeof Message>
  | ThreadMember
  | Snowflake
  | UserResolvable;

class UserManager extends CachedManager<User> {
  constructor(client: Client, iterable?: Iterable<User>) {
    super(client, User, iterable);
  }

  dmChannel(userId: Snowflake): DMChannel | null {
    const channel = this.client.channels.cache.find(
      (channelCandidate) =>
        isDMChannel(channelCandidate) &&
        channelCandidate.recipient.id === userId
    );
    return channel && isDMChannel(channel) ? channel : null;
  }

  async createDM(
    user: UserResolvableSource,
    { cache = true, force = false }: BaseFetchOptions = {}
  ): Promise<DMChannel> {
    const id = this.resolveId(user);
    if (!id) {
      throw new Error("USER_RESOLVE_ID");
    }

    if (!force) {
      const dmChannel = this.dmChannel(id);
      if (dmChannel && !dmChannel.partial) {
        return dmChannel;
      }
    }

    const data = await this.client.api.users["@me"].channels.post({
      DiscordContext: {},
      data: {
        recipients: [id],
      },
    });

    const dm_channel = await this.client.channels._add(data, null, { cache });
    if (!dm_channel || !isDMChannel(dm_channel)) {
      throw new Error("INVALID_TYPE", "channel", "DMChannel");
    }
    dm_channel.sync();
    return dm_channel;
  }

  async deleteDM(user: UserResolvableSource): Promise<DMChannel> {
    const id = this.resolveId(user);
    if (!id) {
      throw new Error("USER_RESOLVE_ID");
    }
    const dmChannel = this.dmChannel(id);
    if (!dmChannel) {
      throw new Error("USER_NO_DM_CHANNEL");
    }
    await this.client.api.channels(dmChannel.id).delete();
    this.client.channels._remove(dmChannel.id);
    return dmChannel;
  }

  async fetch(
    user: UserResolvableSource,
    { cache = true, force = false }: BaseFetchOptions = {}
  ): Promise<User | null> {
    const id = this.resolveId(user);
    if (!id) {
      return null;
    }
    if (!force) {
      const existing = this.cache.get(id);
      if (existing && !existing.partial) {
        return existing;
      }
    }

    const data = await this.client.api.users(id).get();
    return this._add(data, cache);
  }

  async send(user: UserResolvableSource, options: SendOptions) {
    const dmChannel = await this.createDM(user);
    return dmChannel.send(options);
  }

  resolve(user: unknown): User | null {
    if (user instanceof GuildMember || user instanceof ThreadMember) {
      return user.user;
    }
    if (user instanceof Message) {
      return user.author;
    }
    return super.resolve(user);
  }

  resolveId(user: unknown): string | null {
    if (user instanceof ThreadMember) {
      return user.id;
    }
    if (user instanceof GuildMember) {
      return user.user.id;
    }
    if (user instanceof Message) {
      return user.author?.id ?? null;
    }
    return super.resolveId(user);
  }
}

export default UserManager;
export { UserManager };
