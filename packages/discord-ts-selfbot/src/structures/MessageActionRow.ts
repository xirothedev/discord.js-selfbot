import { ComponentType } from 'discord-api-types/v10';
import type {
  APIActionRowComponent,
  APIComponentInMessageActionRow,
} from 'discord-api-types/v10';
import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
} from './BaseMessageComponent';
import type { MessageComponentInstance } from './BaseMessageComponent';
import MessageButton from './MessageButton';
import MessageSelectMenu from './MessageSelectMenu';
import TextInputComponent from './TextInputComponent';
import type { Client } from '../client/Client';
import type { MessageActionRowComponentResolvable } from '../../typings';

type ActionRowChild = MessageButton | MessageSelectMenu | TextInputComponent;

function isActionRowChild(
  component: MessageComponentInstance | null
): component is ActionRowChild {
  return (
    component instanceof MessageButton ||
    component instanceof MessageSelectMenu ||
    component instanceof TextInputComponent
  );
}

function flattenComponents(
  components: (
    | MessageActionRowComponentResolvable
    | MessageActionRowComponentResolvable[]
  )[]
): MessageActionRowComponentResolvable[] {
  const flattened: MessageActionRowComponentResolvable[] = [];
  for (const component of components) {
    if (Array.isArray(component)) {
      flattened.push(...component);
    } else {
      flattened.push(component);
    }
  }
  return flattened;
}

class MessageActionRow extends BaseMessageComponent {
  declare components: ActionRowChild[];

  constructor(data?: unknown, client: Client | null = null) {
    super({ type: 'ACTION_ROW' });
    const source = isComponentDataSource(data) ? data : {};

    this.components = readComponentArray(source, 'components')
      .map((component) => BaseMessageComponent.create(component, client))
      .filter(isActionRowChild);

    super.setup(data);
  }

  addComponents(
    ...components: (
      | MessageActionRowComponentResolvable
      | MessageActionRowComponentResolvable[]
    )[]
  ) {
    this.components.push(
      ...flattenComponents(components)
        .map((component) => BaseMessageComponent.create(component))
        .filter(isActionRowChild)
    );
    return this;
  }

  setComponents(
    ...components: (
      | MessageActionRowComponentResolvable
      | MessageActionRowComponentResolvable[]
    )[]
  ) {
    this.spliceComponents(0, this.components.length, ...components);
    return this;
  }

  spliceComponents(
    index: number,
    deleteCount: number,
    ...components: (
      | MessageActionRowComponentResolvable
      | MessageActionRowComponentResolvable[]
    )[]
  ) {
    this.components.splice(
      index,
      deleteCount,
      ...flattenComponents(components)
        .map((component) => BaseMessageComponent.create(component))
        .filter(isActionRowChild)
    );
    return this;
  }

  toJSON(): APIActionRowComponent<APIComponentInMessageActionRow> {
    return {
      components: this.components
        .map((component) => component.toJSON())
        .filter(
          (component): component is APIComponentInMessageActionRow =>
            component.type !== ComponentType.TextInput
        ),
      type: ComponentType.ActionRow,
    };
  }
}

export default MessageActionRow;
export { MessageActionRow };
