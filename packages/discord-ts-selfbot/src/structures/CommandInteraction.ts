const BaseCommandInteraction = require('./BaseCommandInteraction');
const CommandInteractionOptionResolver = require('./CommandInteractionOptionResolver');

/**
 * Represents a command interaction.
 * @extends {BaseCommandInteraction}
 */
class CommandInteraction extends BaseCommandInteraction {
  constructor(client: any, data: any) {
    super(client, data);

    /**
     * The options passed to the command.
     * @type {CommandInteractionOptionResolver}
     */
    this.options = new CommandInteractionOptionResolver(
      this.client,
      data.data.options?.map((option: any) => this.transformOption(option, data.data.resolved)) ?? [],
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
      ...this.options._hoistedOptions.map((o: any) => `${o.name}:${o.value}`),
    ];
    return `/${properties.filter(Boolean).join(' ')}`;
  }
}

export = CommandInteraction;
