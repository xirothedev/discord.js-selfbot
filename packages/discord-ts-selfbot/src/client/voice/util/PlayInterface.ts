import { Readable } from 'node:stream';
import prism from 'prism-media';
import _errorsModule from '../../../errors';

const { Error } = _errorsModule;
import type { StreamOptions, VideoOptions } from '../../../../typings';
import type MediaPlayer from '../player/MediaPlayer';
import type AudioDispatcher from '../dispatcher/AudioDispatcher';
import type VideoDispatcher from '../dispatcher/VideoDispatcher';

class PlayInterface {
  declare player: MediaPlayer;

  constructor(player: MediaPlayer) {
    this.player = player;
  }

  playAudio(
    resource: Readable | string,
    options: StreamOptions = {}
  ): AudioDispatcher {
    if (resource instanceof Readable || typeof resource === 'string') {
      const type = options.type || 'unknown';
      if (type === 'unknown') {
        return this.player.playUnknown(resource, options);
      } else if (type === 'converted') {
        if (!(resource instanceof Readable)) {
          throw new Error('VOICE_PRISM_DEMUXERS_NEED_STREAM');
        }
        return this.player.playPCMStream(resource, options);
      } else if (type === 'opus') {
        if (!(resource instanceof Readable)) {
          throw new Error('VOICE_PRISM_DEMUXERS_NEED_STREAM');
        }
        return this.player.playOpusStream(resource, options);
      } else if (type === 'ogg/opus') {
        if (!(resource instanceof Readable)) {
          throw new Error('VOICE_PRISM_DEMUXERS_NEED_STREAM');
        }
        return this.player.playOpusStream(
          resource.pipe(new prism.opus.OggDemuxer()),
          options
        );
      } else if (type === 'webm/opus') {
        if (!(resource instanceof Readable)) {
          throw new Error('VOICE_PRISM_DEMUXERS_NEED_STREAM');
        }
        return this.player.playOpusStream(
          resource.pipe(new prism.opus.WebmDemuxer()),
          options
        );
      }
    }
    throw new Error('VOICE_PLAY_INTERFACE_BAD_TYPE');
  }

  playVideo(
    resource: Readable | string,
    options: VideoOptions = {}
  ): VideoDispatcher {
    if (resource instanceof Readable || typeof resource === 'string') {
      return this.player.playUnknownVideo(resource, options);
    }
    throw new Error('VOICE_PLAY_INTERFACE_BAD_TYPE');
  }

  playStream(
    resource: Readable | string,
    options: VideoOptions = {}
  ): VideoDispatcher {
    return this.playVideo(resource, options);
  }

  static applyToClass(structure: { prototype: object }) {
    for (const prop of ['playAudio', 'playVideo', 'playStream']) {
      const descriptor = Object.getOwnPropertyDescriptor(
        PlayInterface.prototype,
        prop
      );
      if (descriptor) {
        Object.defineProperty(structure.prototype, prop, descriptor);
      }
    }
  }
}

export default PlayInterface;
export { PlayInterface };
