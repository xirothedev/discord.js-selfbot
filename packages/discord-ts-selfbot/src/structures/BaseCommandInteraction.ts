import { Collection } from "@discordjs/collection";
import Interaction from "./Interaction";
import InteractionWebhook from "./InteractionWebhook";
import MessageAttachment from "./MessageAttachment";
import InteractionResponses from "./interfaces/InteractionResponses";
import _ConstantsModule from "../util/Constants";

const { ApplicationCommandOptionTypes } = _ConstantsModule;
import type {
  APIApplicationCommandInteractionDataOption,
  APIInteractionDataResolved,
  APIMessage,
  Snowflake,
} from "discord-api-types/v10";
import type { CacheType } from "../../typings";
import type {
  CommandInteractionOption,
  CommandInteractionResolvedData,
} from "./CommandInteractionOptionResolver";
import type CommandInteractionOptionResolver from "./CommandInteractionOptionResolver";
import type Client from "../client/Client";
import type { RawCommandInteractionData } from "../../typings/rawDataTypes";

type ResolvedData = APIInteractionDataResolved & {
  messages?: Record<Snowflake, APIMessage>;
};

class BaseCommandInteraction<
  Cached extends CacheType = CacheType,
> extends Interaction<Cached> {
  declare commandId: Snowflake;
  declare commandName: string;
  declare deferred: boolean;
  declare replied: boolean;
  declare ephemeral: boolean | null;
  declare webhook: InteractionWebhook;
  declare options: CommandInteractionOptionResolver;

  constructor(client: Client, data: RawCommandInteractionData) {
    super(client, data);

    this.commandId = data.data.id;

    this.commandName = data.data.name;

    this.deferred = false;

    this.replied = false;

    this.ephemeral = null;

    this.webhook = new InteractionWebhook(
      this.client,
      this.applicationId,
      this.token
    );
  }

  get command() {
    const id = this.commandId;
    return this.client.application?.commands.cache.get(id) ?? null;
  }

  transformResolved({
    members,
    users,
    channels,
    roles,
    messages,
    attachments,
  }: ResolvedData): CommandInteractionResolvedData<Cached> {
    const result: CommandInteractionResolvedData<Cached> = {};

    if (members) {
      result.members = new Collection();
      for (const [id, member] of Object.entries(members)) {
        const user = users?.[id];
        result.members.set(
          id,
          this.guild?.members._add({ user, ...member }) ?? member
        );
      }
    }

    if (users) {
      result.users = new Collection();
      for (const user of Object.values(users)) {
        result.users.set(user.id, this.client.users._add(user));
      }
    }

    if (roles) {
      result.roles = new Collection();
      for (const role of Object.values(roles)) {
        result.roles.set(role.id, this.guild?.roles._add(role) ?? role);
      }
    }

    if (channels) {
      result.channels = new Collection();
      for (const channel of Object.values(channels)) {
        result.channels.set(
          channel.id,
          this.client.channels._add(channel, this.guild) ?? channel
        );
      }
    }

    if (messages) {
      result.messages = new Collection();
      for (const message of Object.values(messages)) {
        result.messages.set(
          message.id,
          this.channel?.messages?._add(message) ?? message
        );
      }
    }

    if (attachments) {
      result.attachments = new Collection();
      for (const attachment of Object.values(attachments)) {
        const patched = new MessageAttachment(
          attachment.url,
          attachment.filename,
          attachment
        );
        result.attachments.set(attachment.id, patched);
      }
    }

    return result;
  }

  transformOption(
    option: APIApplicationCommandInteractionDataOption,
    resolved?: ResolvedData
  ): CommandInteractionOption<Cached> {
    const result: CommandInteractionOption<Cached> = {
      name: option.name,
      type: ApplicationCommandOptionTypes[option.type],
    };

    if ("value" in option) {
      result.value = option.value;
    }
    if ("options" in option) {
      result.options =
        option.options?.map((opt) => this.transformOption(opt, resolved)) ?? [];
    }

    if (resolved) {
      const value = "value" in option ? option.value : undefined;
      const key = value === undefined ? undefined : String(value);
      if (key !== undefined) {
        const user = resolved.users?.[key];
        if (user) {
          result.user = this.client.users._add(user);
        }

        const member = resolved.members?.[key];
        if (member) {
          result.member =
            this.guild?.members._add({ user, ...member }) ?? member;
        }

        const channel = resolved.channels?.[key];
        if (channel) {
          result.channel =
            this.client.channels._add(channel, this.guild) ?? channel;
        }

        const role = resolved.roles?.[key];
        if (role) {
          result.role = this.guild?.roles._add(role) ?? role;
        }

        const attachment = resolved.attachments?.[key];
        if (attachment) {
          result.attachment = new MessageAttachment(
            attachment.url,
            attachment.filename,
            attachment
          );
        }
      }
    }

    return result;
  }

  // These are here only for documentation purposes - they are implemented by InteractionResponses
  /* eslint-disable no-empty-function */
  deferReply() {}
  reply() {}
  fetchReply() {}
  editReply() {}
  deleteReply() {}
  followUp() {}
  showModal() {}
  awaitModalSubmit() {}
}

InteractionResponses.applyToClass(BaseCommandInteraction, [
  "deferUpdate",
  "update",
]);

export default BaseCommandInteraction;
export { BaseCommandInteraction };

/* eslint-disable max-len */
