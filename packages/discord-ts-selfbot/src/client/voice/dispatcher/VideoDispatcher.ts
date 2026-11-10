import BaseDispatcher from './BaseDispatcher';
import type MediaPlayer from '../player/MediaPlayer';
import type { DispatcherStreams } from './BaseDispatcher';

/**
 * The class that sends video packet data to the voice connection.
 * ```js
 * // Obtained using:
 * client.voice.joinChannel(channel).then(connection => {
 *   // You can play a file or a stream here:
 *   const dispatcher = connection.playVideo('/home/hydrabolt/video.mp4', { fps: 60, preset: 'ultrafast' });
 * });
 * ```
 * @extends {BaseDispatcher}
 */
class VideoDispatcher extends BaseDispatcher {
  declare fps: number;
  declare mtu: number;

  constructor(player: MediaPlayer, highWaterMark = 12, streams: DispatcherStreams, fps: number, payloadType: number) {
    super(player, highWaterMark, payloadType, true, streams);
    /**
     * Video FPS
     * @type {number}
     */
    this.fps = fps;

    this.mtu = 1200;
  }

  get TIMESTAMP_INC() {
    return 90000 / this.fps;
  }

  get FRAME_LENGTH() {
    return 1000 / this.fps;
  }

  /**
   * Get the type of the dispatcher
   * @returns {'video'}
   */
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

  /**
   * Set FPS
   * @param {number} value fps
   */
  setFPSSource(value: number) {
    this.fps = value;
  }

  _codecCallback(_chunk: Buffer): void {
    throw new Error('The _codecCallback method must be implemented');
  }
}

export default VideoDispatcher;
export { VideoDispatcher };
