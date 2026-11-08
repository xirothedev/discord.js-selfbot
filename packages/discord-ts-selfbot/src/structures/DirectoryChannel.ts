const { Channel } = require('./Channel');

/**
 * Represents a channel that displays a directory of guilds.
 * @extends {Channel}
 */
class DirectoryChannel extends Channel {
  _patch(data: any) {
    super._patch(data);
    /**
     * The channel's name
     * @type {string}
     */
    this.name = data.name;
  }
}

export = DirectoryChannel;
