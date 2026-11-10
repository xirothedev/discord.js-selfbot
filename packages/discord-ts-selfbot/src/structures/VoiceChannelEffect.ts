import _EmojiModule from './Emoji';
const { Emoji } = _EmojiModule;
import type {
  GatewayVoiceChannelEffectSendDispatchData,
  Snowflake,
  VoiceChannelEffectSendAnimationType,
} from 'discord-api-types/v10';
import type { Guild } from './Guild';

class VoiceChannelEffect {
  declare guild: Guild;
  declare channelId: Snowflake;
  declare userId: Snowflake;
  declare emoji: import('./Emoji').Emoji | null;
  declare animationType: VoiceChannelEffectSendAnimationType | null;
  declare animationId: number | null;
  declare soundId: Snowflake | number | null;
  declare soundVolume: number | null;

  constructor(data: GatewayVoiceChannelEffectSendDispatchData, guild: Guild) {
    this.guild = guild;

    this.channelId = data.channel_id;

    this.userId = data.user_id;

    this.emoji = data.emoji ? new Emoji(guild.client, data.emoji) : null;

    this.animationType = data.animation_type ?? null;

    this.animationId = data.animation_id ?? null;

    this.soundId = data.sound_id ?? null;

    this.soundVolume = data.sound_volume ?? null;
  }

  get channel() {
    return this.guild.channels.cache.get(this.channelId) ?? null;
  }
}

export default VoiceChannelEffect;
export { VoiceChannelEffect };
