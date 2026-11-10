import _ConstantsModule from "../../util/Constants";

const { PartialTypes: PartialTypeValues } = _ConstantsModule;
import _ChannelModule from "../../structures/Channel";

const { Channel } = _ChannelModule;
import _MessageModule from "../../structures/Message";

const { Message } = _MessageModule;
import type MessageReaction from "../../structures/MessageReaction";
import User from "../../structures/User";
import type { Client } from "../Client";
import type { PartialTypes } from "../../../typings";
import type { GuildMember } from "../../structures/GuildMember";
import type { GuildScheduledEvent } from "../../structures/GuildScheduledEvent";

/*

ABOUT ACTIONS

Actions are similar to WebSocket Packet Handlers, but since introducing
the REST API methods, in order to prevent rewriting code to handle data,
"actions" have been introduced. They're basically what Packet Handlers
used to be but they're strictly for manipulating data and making sure
that WebSocket events don't clash with REST methods.

*/

type ActionData = Record<string | symbol, unknown>;

interface ActionManager<Holds> {
  cache: { get: (id: string) => Holds | undefined };
  _add(data: unknown, cache?: boolean): Holds;
}

interface ActionChannel {
  id: string;
  guild?: { id: string } | null;
  messages: ActionManager<InstanceType<typeof Message>>;
}

interface ActionMessage {
  partial?: boolean;
  reactions: ActionManager<InstanceType<typeof MessageReaction>>;
}

interface ActionGuild {
  id: string;
  members: ActionManager<InstanceType<typeof GuildMember>>;
  scheduledEvents: ActionManager<InstanceType<typeof GuildScheduledEvent>>;
}

function isActionData(value: unknown): value is ActionData {
  return typeof value === "object" && value !== null;
}

function readString(data: ActionData, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

function readData(data: ActionData, key: string): ActionData | undefined {
  const value = data[key];
  return isActionData(value) ? value : undefined;
}

function isGuildMemberData(
  value: ActionData
): value is ActionData & { user: { id: string } } {
  return isActionData(value.user) && typeof value.user.id === "string";
}

class GenericAction {
  declare client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  handle(data: unknown, ..._rest: unknown[]): unknown {
    return data;
  }

  getPayload<Holds>(
    data: unknown,
    manager: ActionManager<Holds>,
    id: string,
    partialType: PartialTypes,
    cache?: boolean
  ): Holds | undefined {
    const existing = manager.cache.get(id);
    if (!existing && this.client.options.partials.includes(partialType)) {
      return manager._add(data, cache);
    }
    return existing;
  }

  getChannel(data: unknown): InstanceType<typeof Channel> | null | undefined {
    const source = isActionData(data) ? data : {};
    const payloadData: ActionData & { recipients?: ActionData[]; id?: string } =
      {};
    const id = readString(source, "channel_id") ?? readString(source, "id");

    if (!("recipients" in source)) {
      // Try to resolve the recipient, but do not add the client user.
      const recipient = readData(source, "author") ??
        readData(source, "user") ?? { id: readString(source, "user_id") };
      if (recipient.id !== this.client.user?.id) {
        payloadData.recipients = [recipient];
      }
    }

    if (id !== undefined) {
      payloadData.id = id;
    }

    const injected = source[this.client.actions.injectedChannel];
    if (injected instanceof Channel) {
      return injected;
    }

    return this.getPayload(
      { ...source, ...payloadData },
      this.client.channels,
      id ?? "",
      PartialTypeValues.CHANNEL
    );
  }

  getMessage(
    data: unknown,
    channel: ActionChannel,
    cache?: boolean
  ): InstanceType<typeof Message> | null | undefined {
    const source = isActionData(data) ? data : {};
    const id = readString(source, "message_id") ?? readString(source, "id");
    const injected = source[this.client.actions.injectedMessage];
    if (injected instanceof Message) {
      return injected;
    }

    return this.getPayload(
      {
        channel_id: channel.id,
        guild_id: readString(source, "guild_id") ?? channel.guild?.id,
        id,
      },
      channel.messages,
      id ?? "",
      PartialTypeValues.MESSAGE,
      cache
    );
  }

  getReaction(
    data: unknown,
    message: ActionMessage,
    user: { id?: string } | null = null
  ): InstanceType<typeof MessageReaction> | null | undefined {
    const source = isActionData(data) ? data : {};
    const emoji = readData(source, "emoji");
    if (!emoji) {
      return null;
    }
    const emojiId = readString(emoji, "id");
    const emojiName = readString(emoji, "name");
    const id = emojiId ?? (emojiName ? decodeURIComponent(emojiName) : "");
    return this.getPayload(
      {
        count: message.partial ? null : 0,
        emoji,
        me: user?.id === this.client.user?.id,
      },
      message.reactions,
      id,
      PartialTypeValues.REACTION
    );
  }

  getMember(
    data: unknown,
    guild: ActionGuild
  ): InstanceType<typeof GuildMember> | null | undefined {
    const source = isActionData(data) ? data : {};
    const member = readData(source, "member");
    if (!member || !isGuildMemberData(member)) {
      return null;
    }
    const userId = readString(member.user, "id");
    if (!userId) {
      return null;
    }
    return this.getPayload(
      member,
      guild.members,
      userId,
      PartialTypeValues.GUILD_MEMBER
    );
  }

  getUser(data: unknown): InstanceType<typeof User> | null | undefined {
    const source = isActionData(data) ? data : {};
    const id = readString(source, "user_id");
    const injected = source[this.client.actions.injectedUser];
    if (injected instanceof User) {
      return injected;
    }
    if (!id) {
      return null;
    }
    return this.getPayload(
      { id },
      this.client.users,
      id,
      PartialTypeValues.USER
    );
  }

  getUserFromMember(
    data: unknown
  ): InstanceType<typeof User> | null | undefined {
    const source = isActionData(data) ? data : {};
    const guildId = readString(source, "guild_id");
    const member = readData(source, "member");
    const memberUser = member ? readData(member, "user") : undefined;
    if (guildId && member && memberUser && isGuildMemberData(member)) {
      const guild = this.client.guilds.cache.get(guildId);
      if (guild) {
        return guild.members._add(member).user;
      }
      return this.client.users._add(memberUser);
    }
    return this.getUser(source);
  }

  getScheduledEvent(
    data: unknown,
    guild: ActionGuild
  ): InstanceType<typeof GuildScheduledEvent> | null | undefined {
    const source = isActionData(data) ? data : {};
    const id =
      readString(source, "guild_scheduled_event_id") ??
      readString(source, "id");
    if (!id) {
      return null;
    }
    return this.getPayload(
      { guild_id: readString(source, "guild_id") ?? guild.id, id },
      guild.scheduledEvents,
      id,
      PartialTypeValues.GUILD_SCHEDULED_EVENT
    );
  }
}

export default GenericAction;
export { GenericAction };
