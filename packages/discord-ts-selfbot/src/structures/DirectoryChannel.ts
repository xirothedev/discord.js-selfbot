import _ChannelModule from './Channel';
const { Channel } = _ChannelModule;

/**
 * Represents a channel that displays a directory of guilds.
 * @extends {Channel}
 */
class DirectoryChannel extends Channel {
  declare name: string;
  _patch(data: Parameters<typeof Channel.prototype._patch>[0] & { name?: string }) {
    super._patch(data);
    /**
     * The channel's name
     * @type {string}
     */
    if (typeof data.name === 'string') this.name = data.name;
  }
}

export default DirectoryChannel;
export { DirectoryChannel };
