import EventEmitter from 'node:events';
import { Readable as ReadableStream } from 'node:stream';
import prism from 'prism-media';
import _AnnexBNalSplitterModule from './processing/AnnexBNalSplitter';

const { H264NalSplitter, H265NalSplitter } = _AnnexBNalSplitterModule;
import _IvfSplitterModule from './processing/IvfSplitter';

const { IvfTransformer } = _IvfSplitterModule;
import _AnnexBDispatcherModule from '../dispatcher/AnnexBDispatcher';

const { H264Dispatcher } = _AnnexBDispatcherModule;
import AudioDispatcher from '../dispatcher/AudioDispatcher';
import _VPxDispatcherModule from '../dispatcher/VPxDispatcher';

const { VP8Dispatcher } = _VPxDispatcherModule;
import type { StreamOptions, VideoOptions } from '../../../../typings';
import type VideoDispatcher from '../dispatcher/VideoDispatcher';
import type { DispatcherStreams } from '../dispatcher/BaseDispatcher';
import type BaseDispatcher from '../dispatcher/BaseDispatcher';
import type VoiceConnection from '../VoiceConnection';
/*
Credit: https://github.com/dank074/Discord-video-stream
The use of video streaming in this library is an incomplete implementation with many bugs, primarily aimed at lazy users.
The video streaming features in this library are sourced from https://github.com/dank074/Discord-video-stream.

Please use the @dank074/discord-video-stream library to access all advanced and professional features,
along with comprehensive support. I will not actively fix bugs related to streaming and encourage everyone to
use https://github.com/dank074/Discord-video-stream for stable and smooth streaming.

To reiterate: This is an incomplete implementation of the library https://github.com/dank074/Discord-video-stream.

Thanks to dank074 and longnguyen2004 for implementing new codecs (H264, H265).
Thanks to mrjvs for discovering how Discord transmits data and the VP8 codec.

Please use the @dank074/discord-video-stream library for the best support.
*/

type VideoOptionsSource = VideoOptions & {
  presetH265?:
    | 'ultrafast'
    | 'superfast'
    | 'veryfast'
    | 'faster'
    | 'fast'
    | 'medium'
    | 'slow'
    | 'slower'
    | 'veryslow';
};

const FFMPEG_OUTPUT_PREFIX = [
  '-use_wallclock_as_timestamps',
  '1',
  '-copyts',
  '-analyzeduration',
  '0',
];
const FFMPEG_INPUT_PREFIX = [
  '-reconnect',
  '1',
  '-reconnect_at_eof',
  '1',
  '-reconnect_streamed',
  '1',
  '-reconnect_delay_max',
  '4294',
];
const FFMPEG_PCM_ARGUMENTS = ['-f', 's16le', '-ar', '48000', '-ac', '2'];
const FFMPEG_VP8_ARGUMENTS = [
  '-f',
  'ivf',
  '-deadline',
  'realtime',
  '-c:v',
  'libvpx',
];
const FFMPEG_H264_ARGUMENTS = (options?: VideoOptionsSource) => [
  '-c:v',
  'libx264',
  '-f',
  'h264',
  '-tune',
  'zerolatency',
  // '-pix_fmt',
  // 'yuv420p',
  '-preset',
  options?.presetH26x || 'faster',
  '-profile:v',
  'baseline',
  // '-g',
  // `${options?.fps}`,
  // '-x264-params',
  // `keyint=${options?.fps}:min-keyint=${options?.fps}`,
  '-bf',
  '0',
  '-bsf:v',
  'h264_metadata=aud=insert',
];

const FFMPEG_H265_ARGUMENTS = (options?: VideoOptionsSource) => [
  '-c:v',
  'libx265',
  '-f',
  'hevc',
  '-preset',
  options?.presetH265 || 'faster',
  '-profile:v',
  'main',
  '-bf',
  '0',
];

function buildVideoArguments(
  input: ReadableStream | string,
  options: VideoOptionsSource
): string[] {
  const args = [
    '-i',
    input instanceof ReadableStream ? '-' : String(input),
    ...FFMPEG_OUTPUT_PREFIX,
    '-flags',
    'low_delay',
    '-r',
    `${options?.fps}`,
  ];

  if (options?.bitrate && typeof options?.bitrate === 'number') {
    args.push('-b:v', `${options?.bitrate}K`);
  }

  if (options?.hwAccel === true) {
    args.unshift('-hwaccel', 'auto');
  }

  if (options.seek) {
    args.unshift('-ss', String(options.seek));
  }

  // Check input
  if (typeof input === 'string' && input.startsWith('http')) {
    args.unshift(...FFMPEG_INPUT_PREFIX);
  }

  return args;
}

class MediaPlayer extends EventEmitter {
  declare dispatcher: BaseDispatcher | null;
  declare videoDispatcher: BaseDispatcher | null;
  declare voiceConnection: VoiceConnection;
  declare isScreenSharing: boolean;

  constructor(voiceConnection: VoiceConnection, isScreenSharing: boolean) {
    super();

    this.dispatcher = null;

    this.videoDispatcher = null;
    this.voiceConnection = voiceConnection;

    this.isScreenSharing = isScreenSharing;
  }

  destroy() {
    this.destroyDispatcher();
    this.destroyVideoDispatcher();
  }

  destroyDispatcher() {
    if (this.dispatcher) {
      this.dispatcher.destroy();
      this.dispatcher = null;
    }
  }

  destroyVideoDispatcher() {
    if (this.videoDispatcher) {
      this.videoDispatcher.destroy();
      this.videoDispatcher = null;
    }
  }

  playUnknown(
    input: ReadableStream | string,
    options: StreamOptions,
    streams: DispatcherStreams = {}
  ): AudioDispatcher {
    this.destroyDispatcher();
    const isStream = input instanceof ReadableStream;
    const args = [...FFMPEG_OUTPUT_PREFIX, ...FFMPEG_PCM_ARGUMENTS];
    if (!isStream) {
      args.unshift('-i', input);
    }
    if (options.seek) {
      args.unshift('-ss', String(options.seek));
    }
    // Check input
    if (typeof input === 'string' && input.startsWith('http')) {
      args.unshift(...FFMPEG_INPUT_PREFIX);
    }

    const ffmpeg = new prism.FFmpeg({ args });
    this.emit(
      'debug',
      `[ffmpeg-audio_process] Spawn process with args:\n${args.join(' ')}`
    );

    ffmpeg.process.stderr?.on('data', (data: Buffer) => {
      this.emit('debug', `[ffmpeg-audio_process]: ${data.toString()}`);
    });

    streams.ffmpeg = ffmpeg;
    if (isStream) {
      streams.input = input;
      input.pipe(ffmpeg);
    }
    return this.playPCMStream(ffmpeg, options, streams);
  }

  playPCMStream(
    stream: ReadableStream,
    options: StreamOptions,
    streams: DispatcherStreams = {}
  ): AudioDispatcher {
    this.destroyDispatcher();
    const opus = new prism.opus.Encoder({
      channels: 2,
      frameSize: 960,
      rate: 48_000,
    });
    streams.opus = opus;
    if (options && options.volume === false) {
      stream.pipe(opus);
      return this.playOpusStream(opus, options, streams);
    }
    const volume = new prism.VolumeTransformer({
      type: 's16le',
      volume: typeof options.volume === 'number' ? options.volume : 1,
    });
    streams.volume = volume;
    stream.pipe(volume).pipe(opus);
    return this.playOpusStream(opus, options, streams);
  }

  playOpusStream(
    stream: ReadableStream,
    options: StreamOptions,
    streams: DispatcherStreams = {}
  ): AudioDispatcher {
    this.destroyDispatcher();
    streams.opus = stream;
    if (options.volume !== false && !streams.input) {
      streams.input = stream;
      const decoder = new prism.opus.Decoder({
        channels: 2,
        frameSize: 960,
        rate: 48_000,
      });
      const volume = new prism.VolumeTransformer({
        type: 's16le',
        volume: typeof options.volume === 'number' ? options.volume : 1,
      });
      streams.volume = volume;
      const encoded = stream
        .pipe(decoder)
        .pipe(volume)
        .pipe(
          new prism.opus.Encoder({ channels: 2, frameSize: 960, rate: 48_000 })
        );
      streams.opus = encoded;
    }
    const dispatcher = this.createDispatcher(options, streams);
    streams.opus?.pipe(dispatcher);
    return dispatcher;
  }

  playUnknownVideo(
    input: ReadableStream | string,
    options: VideoOptionsSource = {}
  ): VideoDispatcher {
    this.destroyVideoDispatcher();
    const isStream = input instanceof ReadableStream;
    if (!options?.fps) {
      options.fps = 30;
    }

    const args = buildVideoArguments(input, options);

    // Get stream type
    if (this.voiceConnection.videoCodec === 'VP8') {
      args.push(...FFMPEG_VP8_ARGUMENTS);
      // Remove  '-speed', '5' bc bad quality
    }

    if (this.voiceConnection.videoCodec === 'H264') {
      args.push(...FFMPEG_H264_ARGUMENTS(options));
    }

    if (this.voiceConnection.videoCodec === 'H265') {
      args.push(...FFMPEG_H265_ARGUMENTS(options));
    }

    args.push('-force_key_frames', '00:02');

    if (options?.inputFFmpegArgs) {
      args.unshift(...options.inputFFmpegArgs);
    }

    if (options?.outputFFmpegArgs) {
      args.push(...options.outputFFmpegArgs);
    }

    const ffmpeg = new prism.FFmpeg({ args });
    const streams: DispatcherStreams = { ffmpeg };

    if (isStream) {
      streams.input = input;
      input.pipe(ffmpeg);
    }

    this.emit(
      'debug',
      `[ffmpeg-video_process] Spawn process with args:\n${args.join(' ')}`
    );

    ffmpeg.process.stderr?.on('data', (data: Buffer) => {
      this.emit('debug', `[ffmpeg-video_process]: ${data.toString()}`);
    });

    switch (this.voiceConnection.videoCodec) {
      case 'VP8': {
        return this.playIvfVideo(ffmpeg, options, streams);
      }
      case 'H264': {
        return this.playAnnexBVideo(ffmpeg, options, streams, 'H264');
      }
      default: {
        throw new Error('Invalid codec (Supported: VP8, H264)');
      }
    }
  }

  playIvfVideo(
    stream: ReadableStream,
    options: VideoOptionsSource,
    streams: DispatcherStreams
  ): VideoDispatcher {
    this.destroyVideoDispatcher();
    const videoStream = new IvfTransformer();
    stream.pipe(videoStream);
    streams.video = videoStream;
    const dispatcher = this.createVideoDispatcher(options, streams);
    videoStream?.pipe(dispatcher);
    return dispatcher;
  }

  playAnnexBVideo(
    stream: ReadableStream,
    options: VideoOptionsSource,
    streams: DispatcherStreams,
    type: 'H264' | 'H265'
  ): VideoDispatcher {
    this.destroyVideoDispatcher();
    const videoStream =
      type === 'H264' ? new H264NalSplitter() : new H265NalSplitter();
    stream.pipe(videoStream);
    streams.video = videoStream;
    const dispatcher = this.createVideoDispatcher(options, streams);
    videoStream?.pipe(dispatcher);
    return dispatcher;
  }

  createDispatcher(
    options: StreamOptions,
    streams: DispatcherStreams
  ): AudioDispatcher {
    this.destroyDispatcher();
    const dispatcher = new AudioDispatcher(this, options, streams);
    this.dispatcher = dispatcher;
    return dispatcher;
  }

  createVideoDispatcher(
    options: VideoOptionsSource,
    streams: DispatcherStreams
  ): VideoDispatcher {
    this.destroyVideoDispatcher();
    switch (this.voiceConnection.videoCodec) {
      case 'VP8': {
        const dispatcher = new VP8Dispatcher(
          this,
          options?.highWaterMark,
          streams,
          options.fps ?? 30
        );
        this.videoDispatcher = dispatcher;
        return dispatcher;
      }
      case 'H264': {
        const dispatcher = new H264Dispatcher(
          this,
          options?.highWaterMark,
          streams,
          options.fps ?? 30
        );
        this.videoDispatcher = dispatcher;
        return dispatcher;
      }
      default: {
        throw new Error('Invalid codec');
      }
    }
  }
}

export default MediaPlayer;
export { MediaPlayer };
