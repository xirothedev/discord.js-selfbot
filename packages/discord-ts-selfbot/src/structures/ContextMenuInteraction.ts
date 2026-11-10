import BaseCommandInteraction from './BaseCommandInteraction';
import CommandInteractionOptionResolver from './CommandInteractionOptionResolver';
import _ConstantsModule from '../util/Constants';
const { ApplicationCommandOptionTypes, ApplicationCommandTypes } = _ConstantsModule;
import type { APIContextMenuInteraction, APIContextMenuInteractionData, Snowflake } from 'discord-api-types/v10';
import type { ApplicationCommandType, CacheType } from '../../typings';
import type { CommandInteractionOption } from './CommandInteractionOptionResolver';

class ContextMenuInteraction<Cached extends CacheType = CacheType> extends BaseCommandInteraction<Cached> {
  declare targetId: Snowflake;
  declare targetType: Exclude<ApplicationCommandType, 'CHAT_INPUT'>;

  constructor(client: import('../client/Client').default, data: APIContextMenuInteraction) {
    super(client, data);
    this.options = new CommandInteractionOptionResolver<Cached>(
      this.client,
      this.resolveContextMenuOptions(data.data),
      this.transformResolved(data.data.resolved),
    );

    this.targetId = data.data.target_id;

    this.targetType = data.data.type === ApplicationCommandTypes.MESSAGE ? 'MESSAGE' : 'USER';
  }

  resolveContextMenuOptions({
    target_id,
    resolved,
  }: APIContextMenuInteractionData): CommandInteractionOption<Cached>[] {
    const result: CommandInteractionOption<Cached>[] = [];

    if ('users' in resolved && resolved.users[target_id]) {
      result.push(
        this.transformOption({ name: 'user', type: ApplicationCommandOptionTypes.USER, value: target_id }, resolved),
      );
    }

    if ('messages' in resolved && resolved.messages[target_id]) {
      result.push({
        name: 'message',
        type: '_MESSAGE' as CommandInteractionOption<Cached>['type'],
        value: target_id,
        message: this.channel?.messages._add(resolved.messages[target_id]) ?? resolved.messages[target_id],
      });
    }

    return result;
  }
}

export default ContextMenuInteraction;
export { ContextMenuInteraction };
