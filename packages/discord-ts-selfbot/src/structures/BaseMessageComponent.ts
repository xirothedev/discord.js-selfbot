import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';
const { MessageComponentTypes, Events } = _ConstantsModule;
import type { Client } from '../client/Client';
import type { MessageComponentType } from '../../typings';
import type MessageActionRow from './MessageActionRow';
import type MessageButton from './MessageButton';
import type MessageSelectMenu from './MessageSelectMenu';
import type TextInputComponent from './TextInputComponent';
import type SectionComponent from './SectionComponent';
import type TextDisplayComponent from './TextDisplayComponent';
import type ThumbnailComponent from './ThumbnailComponent';
import type MediaGalleryComponent from './MediaGalleryComponent';
import type FileComponent from './FileComponent';
import type SeparatorComponent from './SeparatorComponent';
import type ContainerComponent from './ContainerComponent';

export type MessageComponentInstance =
  | MessageActionRow
  | MessageButton
  | MessageSelectMenu
  | TextInputComponent
  | SectionComponent
  | TextDisplayComponent
  | ThumbnailComponent
  | MediaGalleryComponent
  | FileComponent
  | SeparatorComponent
  | ContainerComponent;

export type TopLevelComponentSource =
  | MessageActionRow
  | SectionComponent
  | TextDisplayComponent
  | MediaGalleryComponent
  | FileComponent
  | SeparatorComponent
  | ContainerComponent;

export type ContainerComponentSource =
  | MessageActionRow
  | SectionComponent
  | TextDisplayComponent
  | MediaGalleryComponent
  | FileComponent
  | SeparatorComponent;

export interface ComponentDataSource {
  type?: string | number;
  id?: number;
  [key: string]: unknown;
}

export function isComponentDataSource(value: unknown): value is ComponentDataSource {
  return typeof value === 'object' && value !== null;
}

export function readComponentString(data: ComponentDataSource, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

export function readComponentNumber(data: ComponentDataSource, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'number') return value;
  }
  return undefined;
}

export function readComponentBoolean(data: ComponentDataSource, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

export function readComponentArray(data: ComponentDataSource, key: string): unknown[] {
  const value = data[key];
  return Array.isArray(value) ? value : [];
}

export function readComponentRecord(data: ComponentDataSource, key: string): ComponentDataSource | undefined {
  const value = data[key];
  return isComponentDataSource(value) ? value : undefined;
}

function isMessageComponentType(value: unknown): value is MessageComponentType {
  return typeof value === 'string' && value in MessageComponentTypes;
}

class BaseMessageComponent {
  declare type: MessageComponentType | null;
  declare data: ComponentDataSource;

  constructor(data: unknown) {
    const source = isComponentDataSource(data) ? data : {};
    this.type = source.type !== undefined ? (BaseMessageComponent.resolveType(source.type) ?? null) : null;
  }

  setup(data: unknown) {
    this.data = isComponentDataSource(data) ? data : {};
  }

  get id() {
    return this.data.id!;
  }

  static create(data: unknown, client: Client | null = null): MessageComponentInstance | null {
    let component: MessageComponentInstance | null = null;
    const source = isComponentDataSource(data) ? data : {};
    let type = source.type;
    const FileComponent = require('./FileComponent').default;
    const SeparatorComponent = require('./SeparatorComponent').default;
    const ContainerComponent = require('./ContainerComponent').default;
    const MessageActionRow = require('./MessageActionRow').default;
    const MessageButton = require('./MessageButton').default;
    const MessageSelectMenu = require('./MessageSelectMenu').default;
    const TextInputComponent = require('./TextInputComponent').default;
    const SectionComponent = require('./SectionComponent').default;
    const TextDisplayComponent = require('./TextDisplayComponent').default;
    const ThumbnailComponent = require('./ThumbnailComponent').default;
    const MediaGalleryComponent = require('./MediaGalleryComponent').default;

    if (typeof type === 'string') type = resolveEnumValue(MessageComponentTypes, type);

    switch (type) {
      case MessageComponentTypes.ACTION_ROW: {
        component = data instanceof MessageActionRow ? data : new MessageActionRow(data, client);
        break;
      }
      case MessageComponentTypes.BUTTON: {
        component = data instanceof MessageButton ? data : new MessageButton(data);
        break;
      }
      case MessageComponentTypes.STRING_SELECT:
      case MessageComponentTypes.USER_SELECT:
      case MessageComponentTypes.ROLE_SELECT:
      case MessageComponentTypes.MENTIONABLE_SELECT:
      case MessageComponentTypes.CHANNEL_SELECT: {
        component = data instanceof MessageSelectMenu ? data : new MessageSelectMenu(data);
        break;
      }
      case MessageComponentTypes.TEXT_INPUT: {
        component = data instanceof TextInputComponent ? data : new TextInputComponent(data);
        break;
      }
      case MessageComponentTypes.SECTION: {
        component = data instanceof SectionComponent ? data : new SectionComponent(data);
        break;
      }
      case MessageComponentTypes.TEXT_DISPLAY: {
        component = data instanceof TextDisplayComponent ? data : new TextDisplayComponent(data);
        break;
      }
      case MessageComponentTypes.THUMBNAIL: {
        component = data instanceof ThumbnailComponent ? data : new ThumbnailComponent(data);
        break;
      }
      case MessageComponentTypes.MEDIA_GALLERY: {
        component = data instanceof MediaGalleryComponent ? data : new MediaGalleryComponent(data);
        break;
      }
      case MessageComponentTypes.FILE: {
        component = data instanceof FileComponent ? data : new FileComponent(data);
        break;
      }
      case MessageComponentTypes.SEPARATOR: {
        component = data instanceof SeparatorComponent ? data : new SeparatorComponent(data);
        break;
      }
      case MessageComponentTypes.CONTAINER: {
        component = data instanceof ContainerComponent ? data : new ContainerComponent(data);
        break;
      }
      default:
        if (client) {
          client.emit(Events.DEBUG, `[BaseMessageComponent] Received component with unknown type: ${source.type}`);
        } else {
          throw new TypeError('INVALID_TYPE', 'data.type', 'valid MessageComponentType');
        }
    }
    return component;
  }

  static resolveType(type: string | number | undefined): MessageComponentType | undefined {
    if (typeof type === 'number') {
      const name = MessageComponentTypes[type];
      return isMessageComponentType(name) ? name : undefined;
    }
    return isMessageComponentType(type) ? type : undefined;
  }

  static isTopLevelComponent(component: MessageComponentInstance | null): component is TopLevelComponentSource {
    const MessageActionRow = require('./MessageActionRow').default;
    const SectionComponent = require('./SectionComponent').default;
    const TextDisplayComponent = require('./TextDisplayComponent').default;
    const MediaGalleryComponent = require('./MediaGalleryComponent').default;
    const FileComponent = require('./FileComponent').default;
    const SeparatorComponent = require('./SeparatorComponent').default;
    const ContainerComponent = require('./ContainerComponent').default;

    return (
      component instanceof MessageActionRow ||
      component instanceof SectionComponent ||
      component instanceof TextDisplayComponent ||
      component instanceof MediaGalleryComponent ||
      component instanceof FileComponent ||
      component instanceof SeparatorComponent ||
      component instanceof ContainerComponent
    );
  }

  static isContainerComponent(component: MessageComponentInstance | null): component is ContainerComponentSource {
    const MessageActionRow = require('./MessageActionRow').default;
    const SectionComponent = require('./SectionComponent').default;
    const TextDisplayComponent = require('./TextDisplayComponent').default;
    const MediaGalleryComponent = require('./MediaGalleryComponent').default;
    const FileComponent = require('./FileComponent').default;
    const SeparatorComponent = require('./SeparatorComponent').default;

    return (
      component instanceof MessageActionRow ||
      component instanceof SectionComponent ||
      component instanceof TextDisplayComponent ||
      component instanceof MediaGalleryComponent ||
      component instanceof FileComponent ||
      component instanceof SeparatorComponent
    );
  }

  static serializeContainerComponent(
    component: ContainerComponentSource,
  ): import('discord-api-types/v10').APIComponentInContainer {
    return component.toJSON();
  }

  static serializeTopLevelComponent(
    component: TopLevelComponentSource,
  ): import('discord-api-types/v10').APIMessageTopLevelComponent {
    return component.toJSON();
  }

  static extractInteractiveComponents(component: MessageComponentInstance): MessageComponentInstance[] {
    const type =
      typeof component.type === 'string' ? resolveEnumValue(MessageComponentTypes, component.type) : component.type;

    switch (type) {
      case MessageComponentTypes.ACTION_ROW:
        return 'components' in component ? component.components : [component];
      case MessageComponentTypes.SECTION: {
        const components = 'components' in component ? component.components : [];
        const accessory = 'accessory' in component && component.accessory ? [component.accessory] : [];
        return [...components, ...accessory];
      }
      case MessageComponentTypes.CONTAINER:
        return 'components' in component
          ? component.components.flatMap(child => BaseMessageComponent.extractInteractiveComponents(child))
          : [component];
      default:
        return [component];
    }
  }
}

export default BaseMessageComponent;
export { BaseMessageComponent };
