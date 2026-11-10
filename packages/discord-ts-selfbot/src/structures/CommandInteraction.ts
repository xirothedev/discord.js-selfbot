import BaseCommandInteraction from './BaseCommandInteraction';
import CommandInteractionOptionResolver from './CommandInteractionOptionResolver';
import type { CacheType } from '../../typings';
import type { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

class CommandInteraction<Cached extends CacheType = CacheType> extends BaseCommandInteraction<Cached> {
  constructor(client: import('../client/Client').default, data: APIChatInputApplicationCommandInteraction) {
    super(client, data);

    this.options = new CommandInteractionOptionResolver<Cached>(
      this.client,
      data.data.options?.map(option => this.transformOption(option, data.data.resolved)) ?? [],
      this.transformResolved(data.data.resolved ?? {}),
    );
  }

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
