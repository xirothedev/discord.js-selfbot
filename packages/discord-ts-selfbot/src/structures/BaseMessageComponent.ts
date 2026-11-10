import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
import _errorsModule from "../errors";

const { TypeError } = _errorsModule;
import _ConstantsModule, { resolveEnumValue } from "../util/Constants";

const { MessageComponentTypes, Events } = _ConstantsModule;
import type { Client } from "../client/Client";
import type { MessageComponentType } from "../../typings";
import type MessageActionRow from "./MessageActionRow";
import type MessageButton from "./MessageButton";
import type MessageSelectMenu from "./MessageSelectMenu";
import type TextInputComponent from "./TextInputComponent";
import type SectionComponent from "./SectionComponent";
import type TextDisplayComponent from "./TextDisplayComponent";
import type ThumbnailComponent from "./ThumbnailComponent";
import type MediaGalleryComponent from "./MediaGalleryComponent";
import type FileComponent from "./FileComponent";
import type SeparatorComponent from "./SeparatorComponent";
import type ContainerComponent from "./ContainerComponent";
import type {
  APIComponentInContainer,
  APIMessageTopLevelComponent,
} from "discord-api-types/v10";

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

import type { ComponentDataSource } from "./BaseMessageComponent.helpers";
import {
  isComponentDataSource,
  isMessageComponentType,
} from "./BaseMessageComponent.helpers";

export {
  isComponentDataSource,
  isMessageComponentType,
  readComponentArray,
  readComponentBoolean,
  readComponentNumber,
  readComponentRecord,
  readComponentString,
} from "./BaseMessageComponent.helpers";

function createOrReuse<TComponent>(
  data: unknown,
  Component: new (data: unknown, client?: Client | null) => TComponent,
  client: Client | null
): TComponent {
  return data instanceof Component ? data : new Component(data, client);
}

class BaseMessageComponent {
  declare type: MessageComponentType | null;
  declare data: ComponentDataSource;

  constructor(data: unknown) {
    const source = isComponentDataSource(data) ? data : {};
    this.type =
      source.type === undefined
        ? null
        : (BaseMessageComponent.resolveType(source.type) ?? null);
  }

  setup(data: unknown) {
    this.data = isComponentDataSource(data) ? data : {};
  }

  get id() {
    const { id } = this.data;
    if (id === undefined) {
      throw new TypeError("INVALID_TYPE", "component.id", "number");
    }
    return id;
  }

  static create(
    data: unknown,
    client: Client | null = null
  ): MessageComponentInstance | null {
    let component: MessageComponentInstance | null = null;
    const source = isComponentDataSource(data) ? data : {};
    let { type } = source;
    const FileComponent = require("./FileComponent").default;
    const SeparatorComponent = require("./SeparatorComponent").default;
    const ContainerComponent = require("./ContainerComponent").default;
    const MessageActionRow = require("./MessageActionRow").default;
    const MessageButton = require("./MessageButton").default;
    const MessageSelectMenu = require("./MessageSelectMenu").default;
    const TextInputComponent = require("./TextInputComponent").default;
    const SectionComponent = require("./SectionComponent").default;
    const TextDisplayComponent = require("./TextDisplayComponent").default;
    const ThumbnailComponent = require("./ThumbnailComponent").default;
    const MediaGalleryComponent = require("./MediaGalleryComponent").default;

    if (typeof type === "string") {
      type = resolveEnumValue(MessageComponentTypes, type);
    }

    switch (type) {
      case MessageComponentTypes.ACTION_ROW: {
        component = createOrReuse(data, MessageActionRow, client);
        break;
      }
      case MessageComponentTypes.BUTTON: {
        component = createOrReuse(data, MessageButton, client);
        break;
      }
      case MessageComponentTypes.STRING_SELECT:
      case MessageComponentTypes.USER_SELECT:
      case MessageComponentTypes.ROLE_SELECT:
      case MessageComponentTypes.MENTIONABLE_SELECT:
      case MessageComponentTypes.CHANNEL_SELECT: {
        component = createOrReuse(data, MessageSelectMenu, client);
        break;
      }
      case MessageComponentTypes.TEXT_INPUT: {
        component = createOrReuse(data, TextInputComponent, client);
        break;
      }
      case MessageComponentTypes.SECTION: {
        component = createOrReuse(data, SectionComponent, client);
        break;
      }
      case MessageComponentTypes.TEXT_DISPLAY: {
        component = createOrReuse(data, TextDisplayComponent, client);
        break;
      }
      case MessageComponentTypes.THUMBNAIL: {
        component = createOrReuse(data, ThumbnailComponent, client);
        break;
      }
      case MessageComponentTypes.MEDIA_GALLERY: {
        component = createOrReuse(data, MediaGalleryComponent, client);
        break;
      }
      case MessageComponentTypes.FILE: {
        component = createOrReuse(data, FileComponent, client);
        break;
      }
      case MessageComponentTypes.SEPARATOR: {
        component = createOrReuse(data, SeparatorComponent, client);
        break;
      }
      case MessageComponentTypes.CONTAINER: {
        component = createOrReuse(data, ContainerComponent, client);
        break;
      }
      default: {
        if (client) {
          client.emit(
            Events.DEBUG,
            `[BaseMessageComponent] Received component with unknown type: ${source.type}`
          );
        } else {
          throw new TypeError(
            "INVALID_TYPE",
            "data.type",
            "valid MessageComponentType"
          );
        }
      }
    }
    return component;
  }

  static resolveType(
    type: string | number | undefined
  ): MessageComponentType | undefined {
    if (typeof type === "number") {
      const name = MessageComponentTypes[type];
      return isMessageComponentType(name) ? name : undefined;
    }
    return isMessageComponentType(type) ? type : undefined;
  }

  static isTopLevelComponent(
    component: MessageComponentInstance | null
  ): component is TopLevelComponentSource {
    const MessageActionRow = require("./MessageActionRow").default;
    const SectionComponent = require("./SectionComponent").default;
    const TextDisplayComponent = require("./TextDisplayComponent").default;
    const MediaGalleryComponent = require("./MediaGalleryComponent").default;
    const FileComponent = require("./FileComponent").default;
    const SeparatorComponent = require("./SeparatorComponent").default;
    const ContainerComponent = require("./ContainerComponent").default;

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

  static isContainerComponent(
    component: MessageComponentInstance | null
  ): component is ContainerComponentSource {
    const MessageActionRow = require("./MessageActionRow").default;
    const SectionComponent = require("./SectionComponent").default;
    const TextDisplayComponent = require("./TextDisplayComponent").default;
    const MediaGalleryComponent = require("./MediaGalleryComponent").default;
    const FileComponent = require("./FileComponent").default;
    const SeparatorComponent = require("./SeparatorComponent").default;

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
    component: ContainerComponentSource
  ): APIComponentInContainer {
    return component.toJSON();
  }

  static serializeTopLevelComponent(
    component: TopLevelComponentSource
  ): APIMessageTopLevelComponent {
    return component.toJSON();
  }

  static extractInteractiveComponents(
    component: MessageComponentInstance
  ): MessageComponentInstance[] {
    const type =
      typeof component.type === "string"
        ? resolveEnumValue(MessageComponentTypes, component.type)
        : component.type;

    switch (type) {
      case MessageComponentTypes.ACTION_ROW: {
        return "components" in component ? component.components : [component];
      }
      case MessageComponentTypes.SECTION: {
        const components =
          "components" in component ? component.components : [];
        const accessory =
          "accessory" in component && component.accessory
            ? [component.accessory]
            : [];
        return [...components, ...accessory];
      }
      case MessageComponentTypes.CONTAINER: {
        return "components" in component
          ? component.components.flatMap((child) =>
              BaseMessageComponent.extractInteractiveComponents(child)
            )
          : [component];
      }
      default: {
        return [component];
      }
    }
  }
}

export default BaseMessageComponent;
export { BaseMessageComponent };
