import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import User from '../structures/User';
import type { RESTGetAPIChannelMessageReactionUsersResult } from 'discord-api-types/v10';
import type { MessageReaction } from '../structures/MessageReaction';
import type { FetchReactionUsersOptions, UserResolvable } from '../../typings';

type UserResolvableSource = User | UserResolvable;
type FetchReactionUsersOptionsSource = Omit<FetchReactionUsersOptions, 'type'> & { type?: string | number };
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';
const { ReactionTypes } = _ConstantsModule;

class ReactionUserManager extends CachedManager<User> {
  declare reaction: MessageReaction;
  constructor(reaction: MessageReaction, iterable?: Iterable<User>) {
    super(reaction.client, User, iterable);

    this.reaction = reaction;
  }

  async fetch({ limit = 100, after, type = 'NORMAL' }: FetchReactionUsersOptionsSource = {}) {
    const message = this.reaction.message;
    const data = await this.client.api.channels[message.channelId].messages[message.id].reactions[
      this.reaction.emoji.identifier
    ].get<RESTGetAPIChannelMessageReactionUsersResult>({
      query: { limit, after, type: resolveEnumValue(ReactionTypes, type) },
    });
    const users = new Collection<string, User>();
    for (const rawUser of data) {
      const user = this.client.users._add(rawUser);
      this.cache.set(user.id, user);
      users.set(user.id, user);
    }
    return users;
  }

  async remove(user: UserResolvableSource = this.client.user!) {
    const userId = this.client.users.resolveId(user);
    if (!userId) throw new Error('REACTION_RESOLVE_USER');
    const message = this.reaction.message;
    await this.client.api.channels[message.channelId].messages[message.id].reactions[this.reaction.emoji.identifier][
      userId === this.client.user!.id ? '@me' : userId
    ].delete();
    return this.reaction;
  }
}

export default ReactionUserManager;
export { ReactionUserManager };
