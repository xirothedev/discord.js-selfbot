import BaseCommandInteraction from './BaseCommandInteraction';
import CommandInteractionOptionResolver from './CommandInteractionOptionResolver';
import type { CacheType } from '../../typings';
import type { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

/**
 * Represents a command interaction.
 * @extends {BaseCommandInteraction}
 */
class CommandInteraction<Cached extends CacheType = CacheType> extends BaseCommandInteraction<Cached> {
  constructor(client: import('../client/Client').default, data: APIChatInputApplicationCommandInteraction) {
    super(client, data);

    /**
     * The options passed to the command.
     * @type {CommandInteractionOptionResolver}
     */
    this.options = new CommandInteractionOptionResolver<Cached>(
      this.client,
      data.data.options?.map(option => this.transformOption(option, data.data.resolved)) ?? [],
      this.transformResolved(data.data.resolved ?? {}),
    );
  }

  /**
   * Returns a string representation of the command interaction.
   * This can then be copied by a user and executed again in a new command while keeping the option order.
   * @returns {string}
   */
  toString() {
    const properties = [
      this.commandName,
      this.options._group,
      this.options._subcommand,
      ...this.options._hoistedOptions.map(o => `${o.name}:${o.value}`),
    ];
    return `/${properties.filter(Boolean).join(' ')}`;
  }
}

export default CommandInteraction;
export { CommandInteraction };
