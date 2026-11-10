import CommandInteractionOptionResolver from './CommandInteractionOptionResolver';
import Interaction from './Interaction';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { InteractionResponseTypes, ApplicationCommandOptionTypes } = _ConstantsModule;
import type {
  APIApplicationCommandInteractionDataOption,
  APIChatInputApplicationCommandInteraction,
  Snowflake,
} from 'discord-api-types/v10';
import type { ApplicationCommandOptionChoiceData, CacheType } from '../../typings';
import type { CommandInteractionOption } from './CommandInteractionOptionResolver';

class AutocompleteInteraction<Cached extends CacheType = CacheType> extends Interaction<Cached> {
  declare commandId: Snowflake;
  declare commandName: string;
  declare responded: boolean;
  declare options: Omit<CommandInteractionOptionResolver<Cached>, 'getMessage'>;

  constructor(client: import('../client/Client').default, data: APIChatInputApplicationCommandInteraction) {
    super(client, data);

    this.commandId = data.data.id;

    this.commandName = data.data.name;

    this.responded = false;

    this.options = new CommandInteractionOptionResolver<Cached>(
      this.client,
      data.data.options?.map(option => this.transformOption(option)) ?? [],
    );
  }

  get command() {
    const id = this.commandId;
    return this.client.application?.commands.cache.get(id) ?? null;
  }

  transformOption(option: APIApplicationCommandInteractionDataOption): CommandInteractionOption<Cached> {
    const result: CommandInteractionOption<Cached> = {
      name: option.name,
      type: ApplicationCommandOptionTypes[option.type],
    };

    if ('value' in option) result.value = option.value;
    if ('options' in option) result.options = option.options?.map(opt => this.transformOption(opt)) ?? [];
    if ('focused' in option) result.focused = option.focused;

    return result;
  }

  async respond(options: ApplicationCommandOptionChoiceData[]): Promise<void> {
    if (this.responded) throw new Error('INTERACTION_ALREADY_REPLIED');

    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: {
          choices: options.map(({ nameLocalizations, ...choice }) => ({
            ...choice,
            name_localizations: nameLocalizations,
          })),
        },
      },
      auth: false,
    });
    this.responded = true;
  }
}

export default AutocompleteInteraction;
export { AutocompleteInteraction };
