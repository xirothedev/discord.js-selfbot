import process from 'node:process';
import BaseGuildVoiceChannel from './BaseGuildVoiceChannel';
import Permissions from '../util/Permissions';

let deprecationEmittedForEditable = false;

class VoiceChannel extends BaseGuildVoiceChannel {
  /**
   * Whether the channel is editable by the client user
   * @type {boolean}
   * @readonly
   * @deprecated Use {@link VoiceChannel#manageable} instead
   */
  get editable() {
    if (!deprecationEmittedForEditable) {
      process.emitWarning(
        'The VoiceChannel#editable getter is deprecated. Use VoiceChannel#manageable instead.',
        'DeprecationWarning'
      );

      deprecationEmittedForEditable = true;
    }

    return this.manageable;
  }

  get joinable() {
    if (!super.joinable) {
      return false;
    }
    const { user } = this.client;
    if (
      this.full &&
      !(
        user &&
        (this.permissionsFor(user)?.has(
          Permissions.FLAGS.MOVE_MEMBERS,
          false
        ) ??
          false)
      )
    ) {
      return false;
    }
    return true;
  }

  get speakable() {
    const { user } = this.client;
    const permissions = user ? this.permissionsFor(user) : null;
    if (!permissions) {
      return false;
    }
    // This flag allows speaking even if timed out
    if (permissions.has(Permissions.FLAGS.ADMINISTRATOR, false)) {
      return true;
    }

    const { me } = this.guild.members;
    return Boolean(
      me &&
      me.communicationDisabledUntilTimestamp !== null &&
      me.communicationDisabledUntilTimestamp < Date.now() &&
      permissions.has(Permissions.FLAGS.SPEAK, false)
    );
  }
}

export default VoiceChannel;
export { VoiceChannel };
