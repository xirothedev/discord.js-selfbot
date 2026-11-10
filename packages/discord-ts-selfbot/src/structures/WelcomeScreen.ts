import { Collection } from '@discordjs/collection';
import Base from './Base';
import WelcomeChannel from './WelcomeChannel';
import type { RawWelcomeScreenData } from '../../typings/rawDataTypes';
import { GuildFeature } from 'discord-api-types/v10';
import type { Guild } from './Guild';
import type { InviteGuild } from './InviteGuild';
import type { WelcomeScreenEntity } from '../types/entities/welcome-screen';

class WelcomeScreen extends Base implements WelcomeScreenEntity {
  declare guild: WelcomeScreenEntity['guild'];
  declare description: WelcomeScreenEntity['description'];
  declare welcomeChannels: WelcomeScreenEntity['welcomeChannels'];

  constructor(guild: Guild | InviteGuild, data: RawWelcomeScreenData) {
    super(guild.client);

    this.guild = guild;

    this.description = data.description ?? null;

    this.welcomeChannels = new Collection<string, WelcomeChannel>();

    for (const channel of data.welcome_channels) {
      const welcomeChannel = new WelcomeChannel(this.guild, channel);
      this.welcomeChannels.set(welcomeChannel.channelId, welcomeChannel);
    }
  }

  get enabled() {
    return this.guild.features.includes(GuildFeature.WelcomeScreenEnabled);
  }
}

export default WelcomeScreen;
export { WelcomeScreen };
