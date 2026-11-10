import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
  readComponentRecord,
  readComponentString,
} from './BaseMessageComponent';
import MessageActionRow from './MessageActionRow';
import _ConstantsModule from '../util/Constants';

const { InteractionTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';
import { isGuildBasedChannel } from '../types/channels';
import { ComponentType } from 'discord-api-types/v10';
import type { APITextInputComponent } from 'discord-api-types/v10';
import type { Client } from '../client/Client';

class Modal {
  declare components: MessageActionRow[];
  declare customId: string | null;
  declare title: string | null;
  declare nonce: string;
  declare id: string;
  declare applicationId: string;
  declare channelId: string;
  declare replied: boolean;
  declare client: Client;
  constructor(data: unknown = {}, client: Client | null = null) {
    const source = isComponentDataSource(data) ? data : {};
    this.components = readComponentArray(source, 'components')
      .map((component) => BaseMessageComponent.create(component, client))
      .filter(
        (component): component is MessageActionRow =>
          component instanceof MessageActionRow
      );

    this.customId =
      readComponentString(source, 'custom_id', 'customId') ?? null;

    this.title = readComponentString(source, 'title') ?? null;

    this.nonce = readComponentString(source, 'nonce') ?? '';

    this.id = readComponentString(source, 'id') ?? '';

    const application = readComponentRecord(source, 'application');
    this.applicationId =
      (application ? readComponentString(application, 'id') : undefined) ?? '';

    this.channelId =
      readComponentString(source, 'channel_id', 'channelId') ?? '';

    this.replied = false;

    Object.defineProperty(this, 'client', {
      value: client,
      writable: false,
    });
  }

  get guildId() {
    const channel = this.client.channels.cache.get(this.channelId);
    return (channel && 'guildId' in channel ? channel.guildId : null) || null;
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  get guild() {
    const { channel } = this;
    return (
      this.client.guilds.resolve(this.guildId) ??
      (channel && isGuildBasedChannel(channel) ? channel.guild : null)
    );
  }

  toJSON() {
    return {
      components: this.components.map((row) => ({
        components: row.components.map((component) => component.toJSON()),
        type: ComponentType.ActionRow,
      })),
      custom_id: this.customId,
      id: this.id,
      title: this.title,
    };
  }

  reply() {
    if (
      !this.applicationId ||
      !this.client ||
      !this.channelId ||
      this.replied
    ) {
      throw new Error('Modal cannot reply');
    }
    // Get Object
    const { title: _title, ...dataFinal } = this.toJSON();
    const components = dataFinal.components
      .map((row) => {
        const [first] = row.components;
        if (!first || first.type !== ComponentType.TextInput) {
          return null;
        }
        const input: APITextInputComponent = {
          custom_id: first.custom_id,
          style: first.style,
          type: first.type,
          value: first.value,
        };
        return { components: [input], type: ComponentType.ActionRow };
      })
      .filter(
        (row): row is NonNullable<typeof row> =>
          row !== null && typeof row.components[0]?.value === 'string'
      );
    dataFinal.components = components;
    const nonce = SnowflakeUtil.generate();
    const postData = {
      application_id: this.applicationId,
      channel_id: this.channelId,
      data: { ...dataFinal, components },
      guild_id: this.guildId,
      nonce,
      session_id: this.client.sessionId,
      // Modal
      type: InteractionTypes.MODAL_SUBMIT,
    };
    this.client.api.interactions.post({
      data: postData,
    });
    this.replied = true;
    return Util.createPromiseInteraction(this.client, nonce, 5000, true, this);
  }

  // TypeScript
  get isMessage() {
    return false;
  }
}

export default Modal;
export { Modal };
