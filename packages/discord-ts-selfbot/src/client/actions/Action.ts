import _ConstantsModule from '../../util/Constants';
const { PartialTypes } = _ConstantsModule;

/*

ABOUT ACTIONS

Actions are similar to WebSocket Packet Handlers, but since introducing
the REST API methods, in order to prevent rewriting code to handle data,
"actions" have been introduced. They're basically what Packet Handlers
used to be but they're strictly for manipulating data and making sure
that WebSocket events don't clash with REST methods.

*/

class GenericAction {
  declare client: any;

  constructor(client: any) {
    this.client = client;
  }

  handle(..._args: any[]) {
    return _args[0];
  }

  getPayload(data: any, manager: any, id: any, partialType: any, cache?: any) {
    const existing = manager.cache.get(id);
    if (!existing && this.client.options.partials.includes(partialType)) {
      return manager._add(data, cache);
    }
    return existing;
  }

  getChannel(data: any) {
    const payloadData: any = {};
    const id = data.channel_id ?? data.id;

    if (!('recipients' in data)) {
      // Try to resolve the recipient, but do not add the client user.
      const recipient = data.author ?? data.user ?? { id: data.user_id };
      if (recipient.id !== this.client.user!.id) payloadData.recipients = [recipient];
    }

    if (id !== undefined) payloadData.id = id;

    return (
      data[this.client.actions.injectedChannel] ??
      this.getPayload({ ...data, ...payloadData }, this.client.channels, id, PartialTypes.CHANNEL)
    );
  }

  getMessage(data: any, channel: any, cache?: any) {
    const id = data.message_id ?? data.id;
    return (
      data[this.client.actions.injectedMessage] ??
      this.getPayload(
        {
          id,
          channel_id: channel.id,
          guild_id: data.guild_id ?? channel.guild?.id,
        },
        channel.messages,
        id,
        PartialTypes.MESSAGE,
        cache,
      )
    );
  }

  getReaction(data: any, message: any, user: any = null) {
    const id = data.emoji.id ?? decodeURIComponent(data.emoji.name);
    return this.getPayload(
      {
        emoji: data.emoji,
        count: message.partial ? null : 0,
        me: user?.id === this.client.user!.id,
      },
      message.reactions,
      id,
      PartialTypes.REACTION,
    );
  }

  getMember(data: any, guild: any) {
    return this.getPayload(data, guild.members, data.user.id, PartialTypes.GUILD_MEMBER);
  }

  getUser(data: any) {
    const id = data.user_id;
    return data[this.client.actions.injectedUser] ?? this.getPayload({ id }, this.client.users, id, PartialTypes.USER);
  }

  getUserFromMember(data: any) {
    if (data.guild_id && data.member?.user) {
      const guild = this.client.guilds.cache.get(data.guild_id);
      if (guild) {
        return guild.members._add(data.member).user;
      } else {
        return this.client.users._add(data.member.user);
      }
    }
    return this.getUser(data);
  }

  getScheduledEvent(data: any, guild: any) {
    const id = data.guild_scheduled_event_id ?? data.id;
    return this.getPayload(
      { id, guild_id: data.guild_id ?? guild.id },
      guild.scheduledEvents,
      id,
      PartialTypes.GUILD_SCHEDULED_EVENT,
    );
  }
}

export default GenericAction;
export { GenericAction };
