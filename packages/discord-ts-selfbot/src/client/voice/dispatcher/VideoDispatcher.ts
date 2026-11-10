import BaseDispatcher from './BaseDispatcher';
import type MediaPlayer from '../player/MediaPlayer';
import type { DispatcherStreams } from './BaseDispatcher';

class VideoDispatcher extends BaseDispatcher {
  declare fps: number;
  declare mtu: number;

  constructor(player: MediaPlayer, highWaterMark = 12, streams: DispatcherStreams, fps: number, payloadType: number) {
    super(player, highWaterMark, payloadType, true, streams);
    this.fps = fps;

    this.mtu = 1200;
  }

  get TIMESTAMP_INC() {
    return 90000 / this.fps;
  }

  get FRAME_LENGTH() {
    return 1000 / this.fps;
  }

  getTypeDispatcher() {
    return 'video';
  }

  partitionMtu(data: Buffer): Buffer[] {
    const out: Buffer[] = [];
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i += this.mtu) {
      out.push(data.slice(i, i + this.mtu));
    }

    return out;
  }

  setFPSSource(value: number) {
    this.fps = value;
  }

  _codecCallback(_chunk: Buffer): void {
    throw new Error('The _codecCallback method must be implemented');
  }
}

export default VideoDispatcher;
export { VideoDispatcher };
