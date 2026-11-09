import BaseCommandInteraction from './BaseCommandInteraction';
import CommandInteractionOptionResolver from './CommandInteractionOptionResolver';
import _ConstantsModule from '../util/Constants';
const { ApplicationCommandOptionTypes, ApplicationCommandTypes } = _ConstantsModule;
import type { APIContextMenuInteraction, APIContextMenuInteractionData, Snowflake } from 'discord-api-types/v10';
import type { ApplicationCommandType, CacheType } from '../../typings';
import type { CommandInteractionOption } from './CommandInteractionOptionResolver';

/**
 * Represents a context menu interaction.
 * @extends {BaseCommandInteraction}
 */
class ContextMenuInteraction<Cached extends CacheType = CacheType> extends BaseCommandInteraction<Cached> {
  declare targetId: Snowflake;
  declare targetType: Exclude<ApplicationCommandType, 'CHAT_INPUT'>;

  constructor(client: import('../client/Client').default, data: APIContextMenuInteraction) {
    super(client, data);
    /**
     * The target of the interaction, parsed into options
     * @type {CommandInteractionOptionResolver}
     */
    this.options = new CommandInteractionOptionResolver<Cached>(
      this.client,
      this.resolveContextMenuOptions(data.data),
      this.transformResolved(data.data.resolved),
    );

    /**
     * The id of the target of this interaction
     * @type {Snowflake}
     */
    this.targetId = data.data.target_id;

    /**
     * The type of the target of this interaction; either USER or MESSAGE
     * @type {ApplicationCommandType}
     */
    this.targetType = ApplicationCommandTypes[data.data.type];
  }

  /**
   * Resolves and transforms options received from the API for a context menu interaction.
   * @param {APIApplicationCommandInteractionData} data The interaction data
   * @returns {CommandInteractionOption[]}
   * @private
   */
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
