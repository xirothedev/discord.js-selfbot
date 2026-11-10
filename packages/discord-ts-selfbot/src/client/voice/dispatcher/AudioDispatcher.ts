import BaseDispatcher from "./BaseDispatcher";
import type MediaPlayer from "../player/MediaPlayer";
import type { StreamOptions } from "../../../../typings";
import type { DispatcherStreams } from "./BaseDispatcher";
import VoiceCodec from "../util/VoiceCodec";
import Silence from "../util/Silence";
import VolumeInterface from "../util/VolumeInterface";

const CHANNELS = 2;

class AudioDispatcher extends BaseDispatcher {
  declare streamOptions: {
    seek: number;
    volume: number;
    fec: boolean;
    plp: number;
    bitrate: number;
    highWaterMark: number;
  };

  constructor(
    player: MediaPlayer,
    options: StreamOptions | undefined,
    streams: DispatcherStreams
  ) {
    const {
      seek = 0,
      volume = 1,
      fec,
      plp,
      bitrate = 96,
      highWaterMark = 12,
    } = options ?? {};
    const streamOptions = {
      bitrate: typeof bitrate === "number" ? bitrate : 96,
      fec: Boolean(fec),
      highWaterMark,
      plp: plp ?? 0,
      seek,
      volume: typeof volume === "number" ? volume : 1,
    };
    super(
      player,
      highWaterMark,
      VoiceCodec.getPayloadType("opus"),
      false,
      streams
    );

    this.streamOptions = streamOptions;

    this.streams.silence = new Silence();

    this.setVolume(volume);
    this.setBitrate(bitrate);
    if (fec !== undefined) {
      this.setFEC(fec);
    }
    if (plp !== undefined) {
      this.setPLP(plp);
    }
  }

  get TIMESTAMP_INC() {
    return 480 * CHANNELS;
  }

  get FRAME_LENGTH() {
    return 20;
  }

  getTypeDispatcher() {
    return "audio";
  }

  setBitrate(value: number | "auto") {
    const { opus } = this.streams;
    if (!value || !opus?.setBitrate) {
      return false;
    }
    const bitrate =
      value === "auto"
        ? (this.player.voiceConnection.channel.bitrate ?? 96)
        : value;
    opus.setBitrate(bitrate * 1000);
    return true;
  }

  setPLP(value: number) {
    const { opus } = this.streams;
    if (!opus?.setPLP) {
      return false;
    }
    opus.setPLP(value);
    return true;
  }

  setFEC(enabled: boolean) {
    const { opus } = this.streams;
    if (!opus?.setFEC) {
      return false;
    }
    opus.setFEC(enabled);
    return true;
  }

  get volumeEditable() {
    return Boolean(this.streams.volume);
  }

  get bitrateEditable(): boolean {
    return Boolean(this.streams.opus?.setBitrate);
  }

  // Volume
  get volume() {
    return this.streams.volume ? (this.streams.volume.volume ?? 1) : 1;
  }

  setVolume(value: number | boolean) {
    const { volume } = this.streams;
    if (!volume?.setVolume) {
      return false;
    }
    if (typeof value !== "number") {
      return false;
    }
    this.emit("volumeChange", this.volume, value);
    volume.setVolume(value);
    return true;
  }

  setSyncVideoDispatcher(otherDispatcher: BaseDispatcher) {
    if (otherDispatcher.getTypeDispatcher() !== "video") {
      throw new Error("Dispatcher must be a video dispatcher");
    }
    this._syncDispatcher = otherDispatcher;
  }

  // Volume stubs for docs; VolumeInterface.applyToClass installs the real ones.
  declare volumeDecibels: number;
  declare volumeLogarithmic: number;
  declare setVolumeDecibels: (value: number) => void;
  declare setVolumeLogarithmic: (value: number) => void;
}

VolumeInterface.applyToClass(AudioDispatcher);

export default AudioDispatcher;
export { AudioDispatcher };
