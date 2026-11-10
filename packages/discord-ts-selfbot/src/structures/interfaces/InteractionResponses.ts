import _errorsModule from '../../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../../util/Constants';
const { InteractionResponseTypes, InteractionTypes } = _ConstantsModule;
import MessageFlags from '../../util/MessageFlags';
import InteractionCollector from '../InteractionCollector';
import MessagePayload, { type MessagePayloadOptions } from '../MessagePayload';
import Modal from '../Modal';
import type { Snowflake } from 'discord-api-types/v10';
import type { Collection } from '@discordjs/collection';
import type InteractionWebhook from '../InteractionWebhook';
import type {
  AwaitModalSubmitOptions,
  InteractionDeferReplyOptions,
  InteractionDeferUpdateOptions,
  InteractionEditReplyOptions,
  ModalOptions,
  ModalSubmitInteraction,
} from '../../../typings';

type InteractionReplySourceOptions = MessagePayloadOptions & { ephemeral?: boolean; fetchReply?: boolean };
type InteractionUpdateSourceOptions = MessagePayloadOptions & { fetchReply?: boolean };

class InteractionResponses {
  declare client: import('../../client/Client').default;
  declare id: Snowflake;
  declare token: string;
  declare deferred: boolean;
  declare replied: boolean;
  declare ephemeral: boolean | null;
  declare webhook: InteractionWebhook;

  async deferReply(options: InteractionDeferReplyOptions = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    this.ephemeral = options.ephemeral ?? false;
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: options.ephemeral ? MessageFlags.FLAGS.EPHEMERAL : undefined,
        },
      },
      auth: false,
    });
    this.deferred = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  async reply(options: string | MessagePayload | InteractionReplySourceOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    const replyOptions = typeof options === 'string' || options instanceof MessagePayload ? {} : options;
    this.ephemeral = replyOptions.ephemeral ?? false;

    let messagePayload;
    if (options instanceof MessagePayload) messagePayload = options;
    else messagePayload = MessagePayload.create(this, options);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data,
      },
      files,
      auth: false,
    });
    this.replied = true;

    return replyOptions.fetchReply ? this.fetchReply() : undefined;
  }

  fetchReply(message = '@original') {
    return this.webhook.fetchMessage(message);
  }

  async editReply(options: string | MessagePayload | InteractionEditReplyOptions) {
    if (!this.deferred && !this.replied) throw new Error('INTERACTION_NOT_REPLIED');
    const messageId =
      typeof options === 'string' || options instanceof MessagePayload ? '@original' : (options.message ?? '@original');
    const message = await this.webhook.editMessage(messageId, options);
    this.replied = true;
    return message;
  }

  async deleteReply(message = '@original') {
    await this.webhook.deleteMessage(message);
  }

  async followUp(options: string | MessagePayload | InteractionReplySourceOptions) {
    if (!this.deferred && !this.replied) throw new Error('INTERACTION_NOT_REPLIED');
    return this.webhook.send(options);
  }

  async deferUpdate(options: InteractionDeferUpdateOptions = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_MESSAGE_UPDATE,
      },
      auth: false,
    });
    this.deferred = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  async update(options: string | MessagePayload | InteractionUpdateSourceOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    const updateOptions = typeof options === 'string' || options instanceof MessagePayload ? {} : options;

    let messagePayload;
    if (options instanceof MessagePayload) messagePayload = options;
    else messagePayload = MessagePayload.create(this, options);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.UPDATE_MESSAGE,
        data,
      },
      files,
      auth: false,
    });
    this.replied = true;

    return updateOptions.fetchReply ? this.fetchReply() : undefined;
  }

  async showModal(modal: Modal | ModalOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');

    const _modal = modal instanceof Modal ? modal : new Modal(modal);
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.MODAL,
        data: _modal.toJSON(),
      },
    });
    this.replied = true;
  }

  awaitModalSubmit(options: AwaitModalSubmitOptions<ModalSubmitInteraction>): Promise<ModalSubmitInteraction> {
    if (typeof options.time !== 'number') throw new Error('INVALID_TYPE', 'time', 'number');
    const _options = { ...options, max: 1, interactionType: InteractionTypes.MODAL_SUBMIT };
    return new Promise<ModalSubmitInteraction>((resolve, reject) => {
      const collector = new InteractionCollector<ModalSubmitInteraction>(this.client, _options);
      collector.once('end', (interactions: Collection<Snowflake, ModalSubmitInteraction>, reason: string) => {
        const interaction = interactions.first();
        if (interaction) resolve(interaction);
        else reject(new Error('INTERACTION_COLLECTOR_ERROR', reason));
      });
    });
  }

  static applyToClass(structure: { prototype: object }, ignore: string[] = []) {
    const props = [
      'deferReply',
      'reply',
      'fetchReply',
      'editReply',
      'deleteReply',
      'followUp',
      'deferUpdate',
      'update',
      'showModal',
      'awaitModalSubmit',
    ];

    for (const prop of props) {
      if (ignore.includes(prop)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(InteractionResponses.prototype, prop);
      if (descriptor) Object.defineProperty(structure.prototype, prop, descriptor);
    }
  }
}

export default InteractionResponses;
export { InteractionResponses };
