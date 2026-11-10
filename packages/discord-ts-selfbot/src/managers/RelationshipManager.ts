import { Collection } from "@discordjs/collection";
import BaseManager from "./BaseManager";
import _GuildMemberModule from "../structures/GuildMember";

const { GuildMember } = _GuildMemberModule;
import _MessageModule from "../structures/Message";

const { Message } = _MessageModule;
import ThreadMember from "../structures/ThreadMember";
import User from "../structures/User";
import _ConstantsModule from "../util/Constants";

const { RelationshipTypes } = _ConstantsModule;
import type { Snowflake } from "discord-api-types/v10";
import type { BaseFetchOptions } from "../../typings";
import type { Client } from "../client/Client";

type UserResolvableSource =
  | User
  | InstanceType<typeof GuildMember>
  | InstanceType<typeof Message>
  | ThreadMember
  | Snowflake;

export interface RelationshipData {
  id: Snowflake;
  type: number;
  nickname: string | null;
  since?: string;
}

class RelationshipManager extends BaseManager {
  declare cache: Collection<string, number>;
  declare friendNicknames: Collection<string, string | null>;
  declare sinceCache: Collection<string, Date>;

  constructor(client: Client, users?: RelationshipData[]) {
    super(client);
    this.cache = new Collection();
    this.friendNicknames = new Collection();
    this.sinceCache = new Collection();
    this._setup(users);
  }

  get friendCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache
      .filter((value) => value === RelationshipTypes.FRIEND)
      .keys()) {
      const user = this.client.users.cache.get(key);
      if (user) {
        users.set(key, user);
      }
    }
    return users;
  }

  get blockedCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache
      .filter((value) => value === RelationshipTypes.BLOCKED)
      .keys()) {
      const user = this.client.users.cache.get(key);
      if (user) {
        users.set(key, user);
      }
    }
    return users;
  }

  get incomingCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache
      .filter((value) => value === RelationshipTypes.PENDING_INCOMING)
      .keys()) {
      const user = this.client.users.cache.get(key);
      if (user) {
        users.set(key, user);
      }
    }
    return users;
  }

  get outgoingCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache
      .filter((value) => value === RelationshipTypes.PENDING_OUTGOING)
      .keys()) {
      const user = this.client.users.cache.get(key);
      if (user) {
        users.set(key, user);
      }
    }
    return users;
  }

  toJSON() {
    return this.cache.map((value, key) => ({
      id: key,
      nickname: this.friendNicknames.get(key),
      since: this.sinceCache.get(key)?.toISOString() ?? "",
      type: RelationshipTypes[value],
    }));
  }

  _setup(users?: RelationshipData[]) {
    if (!Array.isArray(users)) {
      return;
    }
    for (const relationShip of users) {
      this.friendNicknames.set(relationShip.id, relationShip.nickname);
      this.cache.set(relationShip.id, relationShip.type);
      this.sinceCache.set(relationShip.id, new Date(relationShip.since || 0));
    }
  }

  resolveId(user: UserResolvableSource): string | null {
    if (user instanceof ThreadMember) {
      return user.id;
    }
    if (user instanceof GuildMember) {
      return user.user.id;
    }
    if (user instanceof Message) {
      return user.author?.id ?? null;
    }
    if (user instanceof User) {
      return user.id;
    }
    return user.match(/\d{17,19}/)?.[0] || null;
  }

  resolveUsername(user: UserResolvableSource): string | null {
    if (user instanceof ThreadMember) {
      return user.guildMember?.user.username ?? null;
    }
    if (user instanceof GuildMember) {
      return user.user.username;
    }
    if (user instanceof Message) {
      return user.author?.username ?? null;
    }
    if (user instanceof User) {
      return user.username;
    }
    return user;
  }

  async fetch(
    user?: UserResolvableSource,
    { force = false }: BaseFetchOptions = {}
  ): Promise<number | RelationshipManager | undefined> {
    if (user) {
      const id = this.resolveId(user);
      if (!id) {
        return undefined;
      }
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) {
          return existing;
        }
      }
      const data =
        await this.client.api.users["@me"].relationships.get<
          RelationshipData[]
        >();
      await this._setup(data);
      return this.cache.get(id);
    }
    const data =
      await this.client.api.users["@me"].relationships.get<
        RelationshipData[]
      >();
    await this._setup(data);
    return this;
  }

  /**
   * Deletes a friend / blocked relationship with a client user or cancels a friend request.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} user Target
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async deleteRelationship(_user: UserResolvableSource): Promise<boolean> {
    throw new Error("Risky action, not finished yet.");
  }

  /**
   * Sends a friend request.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} options Target (User Object, Username, User Id)
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async sendFriendRequest(_options: UserResolvableSource): Promise<boolean> {
    throw new Error("Risky action, not finished yet.");
  }

  /**
   * Accepts a friend request.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} user The user to add as a friend
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async addFriend(_user: UserResolvableSource): Promise<boolean> {
    throw new Error("Risky action, not finished yet.");
  }

  async setNickname(
    user: UserResolvableSource,
    nickname: string | null = null
  ): Promise<boolean> {
    const id = this.resolveId(user);
    if (!id || this.cache.get(id) !== RelationshipTypes.FRIEND) {
      return Promise.resolve(false);
    }
    await this.client.api.users["@me"].relationships[id].patch({
      data: {
        nickname: typeof nickname === "string" ? nickname : null,
      },
    });
    if (nickname) {
      this.friendNicknames.set(id, nickname);
    } else {
      this.friendNicknames.delete(id);
    }
    return true;
  }

  /**
   * Blocks a user.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} user User to block
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async addBlocked(_user: UserResolvableSource): Promise<boolean> {
    throw new Error("Risky action, not finished yet.");
  }
}

export default RelationshipManager;
export { RelationshipManager };
