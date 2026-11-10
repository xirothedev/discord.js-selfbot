import { Collection } from "@discordjs/collection";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Channel }: typeof ChannelModule = require("./Channel");
import Invite from "./Invite";
import type { RawInviteDataSource } from "./Invite";
import TextBasedChannel from "./interfaces/TextBasedChannel";
import MessageManager from "../managers/MessageManager";
import _ConstantsModule from "../util/Constants";

const { Status, Opcodes } = _ConstantsModule;
import DataResolver from "../util/DataResolver";
import _errorsModule from "../errors";

const { TypeError } = _errorsModule;
import type {
  GatewayChannelUpdateDispatchData,
  Snowflake,
} from "discord-api-types/v10";
import type {
  RawChannelData,
  RawInviteData,
  RawUserData,
} from "../../typings/rawDataTypes";
import type {
  BufferResolvable,
  Base64Resolvable,
  GroupDMChannelEditData,
  InviteResolvable,
  StaticImageURLOptions,
  UserResolvable,
} from "../../typings";
import type { PatchOf } from "../types/schema";
import type { Client } from "../client/Client";
import type { User } from "./User";
import type { Message } from "./Message";
import type * as ChannelModule from "./Channel";
import type { SendOptions, SendResult } from "../types/channels";

interface VoiceAdapter {
  destroy: () => void;
  onVoiceServerUpdate: (payload: unknown) => void;
  onVoiceStateUpdate: (payload: unknown) => void;
}

class GroupDMChannel extends Channel {
  declare messages: MessageManager;
  declare _recipients: RawUserData[];
  declare ownerId: Snowflake | null;
  declare lastMessageId: Snowflake | null;
  declare lastPinTimestamp: number | null;
  declare name: string | null;
  declare icon: string | null;

  constructor(client: Client, data: RawChannelData) {
    super(client, data);
    // Override the channel type so partials have a known type
    this.type = "GROUP_DM";

    this.messages = new MessageManager(this);
  }

  _patch(data: PatchOf<"Channel">) {
    super._patch(data);

    if ("recipients" in data && Array.isArray(data.recipients)) {
      this._recipients = data.recipients;
      for (const recipient of data.recipients) {
        this.client.users._add(recipient);
      }
    } else {
      this._recipients = [];
    }

    if ("owner_id" in data) {
      this.ownerId = typeof data.owner_id === "string" ? data.owner_id : null;
    } else {
      this.ownerId ??= null;
    }

    if ("last_message_id" in data) {
      this.lastMessageId = data.last_message_id ?? null;
    } else {
      this.lastMessageId ??= null;
    }

    if ("last_pin_timestamp" in data) {
      this.lastPinTimestamp = data.last_pin_timestamp
        ? Date.parse(data.last_pin_timestamp)
        : null;
    } else {
      this.lastPinTimestamp ??= null;
    }

    if ("name" in data) {
      this.name = data.name ?? null;
    }

    if ("icon" in data) {
      this.icon = data.icon ?? null;
    }
  }

  iconURL({ format = "webp", size }: StaticImageURLOptions = {}) {
    return (
      this.icon &&
      this.client.rest.cdn.GDMIcon(this.id, this.icon, format, size)
    );
  }

  get recipients(): Collection<Snowflake, User> {
    const collect = new Collection<Snowflake, User>();
    for (const recipient of this._recipients) {
      const user = this.client.users.cache.get(recipient.id);
      if (user) {
        collect.set(recipient.id, user);
      }
    }
    if (this.client.user) {
      collect.set(this.client.user.id, this.client.user);
    }
    return collect;
  }

  get owner() {
    return this.ownerId
      ? (this.client.users.cache.get(this.ownerId) ?? null)
      : null;
  }

  get partial() {
    return this.lastMessageId === undefined;
  }

  async delete(slient: string | boolean | null = false) {
    await (typeof slient === "boolean" && slient
      ? this.client.api.channels[this.id].delete({
          query: {
            silent: true,
          },
        })
      : this.client.api.channels[this.id].delete());
    return this;
  }

  toString() {
    return (
      this.name ??
      this._recipients
        .filter((user) => user.id !== this.client.user?.id)
        .map((user) => user.username)
        .join(", ")
    );
  }

  toJSON() {
    const json = super.toJSON({
      createdTimestamp: true,
    });
    json.iconURL = this.iconURL();
    return json;
  }

  async edit(data: GroupDMChannelEditData) {
    const _data: {
      name?: string | null;
      icon?: string | null;
      owner?: UserResolvable;
    } = {};
    if ("name" in data) {
      _data.name = data.name?.trim() ?? null;
    }
    if (data.icon !== undefined) {
      _data.icon = await DataResolver.resolveImage(data.icon);
    }
    if ("owner" in data) {
      _data.owner = data.owner;
    }
    const newData = await this.client.api.channels[
      this.id
    ].patch<GatewayChannelUpdateDispatchData>({
      data: _data,
    });

    return this.client.actions.ChannelUpdate.handle(newData).updated;
  }

  setName(name: string) {
    return this.edit({ name });
  }

  setIcon(icon: BufferResolvable | Base64Resolvable | null) {
    return this.edit({ icon });
  }

  setOwner(user: UserResolvable) {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }
    if (this.ownerId === id) {
      return Promise.resolve(this);
    }
    return this.edit({ owner: id });
  }

  async addUser(user: UserResolvable) {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }
    await this.client.api.channels[this.id].recipients[id].put();
    return this;
  }

  async removeUser(user: UserResolvable) {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }
    await this.client.api.channels[this.id].recipients[id].delete();
    return this;
  }

  async getInvite() {
    const inviteCode = await this.client.api
      .channels(this.id)
      .invites.post<RawInviteDataSource>({
        data: {
          max_age: 86_400,
        },
      });
    return new Invite(this.client, inviteCode);
  }

  async fetchAllInvite(): Promise<Collection<string, Invite>> {
    const invites: RawInviteData[] = await this.client.api
      .channels(this.id)
      .invites.get();
    return new Collection(
      invites.map((invite) => [invite.code, new Invite(this.client, invite)])
    );
  }

  async removeInvite(invite: InviteResolvable) {
    const code = URL.canParse(invite)
      ? new URL(invite).pathname.slice(1)
      : invite;
    if (!code) {
      throw new TypeError("INVALID_TYPE", "invite", "InviteResolvable");
    }
    await this.client.api.channels(this.id).invites[code].delete();
    return this;
  }

  async ring(recipients?: UserResolvable[]): Promise<void> {
    let recipientIds: Snowflake[] | null = null;
    if (recipients && recipients.length > 0) {
      recipientIds = recipients
        .map((r) => this.client.users.resolveId(r))
        .filter(
          (id): id is Snowflake => id !== null && this.recipients.has(id)
        );
    }
    await this.client.api.channels(this.id, "call", "ring").post({
      data: {
        recipients: recipientIds,
      },
    });
  }

  sync() {
    this.client.ws.broadcast({
      d: {
        channel_id: this.id,
      },
      op: Opcodes.DM_UPDATE,
    });
  }

  get voiceUsers(): Collection<Snowflake, User> {
    const coll = new Collection<Snowflake, User>();
    for (const state of this.client.voiceStates.cache.values()) {
      if (state.channelId === this.id && state.user) {
        coll.set(state.id, state.user);
      }
    }
    return coll;
  }

  get shard() {
    return this.client.ws.shards.first();
  }

  get voiceAdapterCreator() {
    return (methods: VoiceAdapter) => {
      this.client.voice.adapters.set(this.id, methods);
      return {
        destroy: () => {
          this.client.voice.adapters.delete(this.id);
        },
        sendPayload: (data: unknown) => {
          const { shard } = this;
          if (!shard || shard.status !== Status.READY) {
            return false;
          }
          shard.send(data);
          return true;
        },
      };
    };
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  get lastMessage(): Message | null {
    return null;
  }
  get lastPinAt(): Date | null {
    return null;
  }
  declare send: (options: SendOptions) => SendResult;
  sendTyping() {
    // Implemented by the subclass mixin.
  }
  createMessageCollector() {
    // Implemented by the subclass mixin.
  }
  awaitMessages() {
    // Implemented by the subclass mixin.
  }
  // Doesn't work on DM channels; setRateLimitPerUser() {}
  // Doesn't work on DM channels; setNSFW() {}
}

TextBasedChannel.applyToClass(GroupDMChannel, true, [
  "fetchWebhooks",
  "createWebhook",
  "setRateLimitPerUser",
  "setNSFW",
]);

export default GroupDMChannel;
export { GroupDMChannel };
