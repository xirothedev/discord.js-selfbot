const ContextMenuInteraction = require('./ContextMenuInteraction');

/**
 * Represents a message context menu interaction.
 * @extends {ContextMenuInteraction}
 */
class MessageContextMenuInteraction extends ContextMenuInteraction {
  [key: string]: any;
  /**
   * The message this interaction was sent from
   * @type {Message|APIMessage}
   * @readonly
   */
  get targetMessage() {
    return this.options.getMessage('message');
  }
}

export = MessageContextMenuInteraction;
