import EventEmitter from "node:events";
import prism from "prism-media";
import PacketHandler from "./PacketHandler";
import _errorsModule from "../../../errors";

const { Error } = _errorsModule;
import _PCMInsertSilenceModule from "../player/processing/PCMInsertSilence";

const { PCMInsertSilence } = _PCMInsertSilenceModule;
import type { UserResolvable } from "../../../../typings";
import type { Writable } from "node:stream";
import type VoiceConnection from "../VoiceConnection";

interface ReceiveStreamOptions {
  mode?: "opus" | "pcm";
  end?: "silence" | "manual";
  paddingSilence?: boolean;
}

class VoiceReceiver extends EventEmitter {
  declare connection: VoiceConnection;
  declare packets: PacketHandler;

  constructor(connection: VoiceConnection) {
    super();
    this.connection = connection;
    this.packets = new PacketHandler(this);
    this.packets.on("error", (err: unknown) => this.emit("debug", err));
  }

  createStream(
    user: UserResolvable,
    {
      mode = "opus",
      end = "silence",
      paddingSilence = false,
    }: ReceiveStreamOptions = {}
  ) {
    const resolvedUser = this.connection.client.users.resolve(user);
    if (!resolvedUser) {
      throw new Error("VOICE_USER_MISSING");
    }
    const padSilence = end === "silence" ? false : paddingSilence;
    // Opus stream.
    const stream = this.packets.makeStream(resolvedUser.id, end);
    if (padSilence) {
      const decoder = new prism.opus.Decoder({
        channels: 2,
        frameSize: 960,
        rate: 48_000,
      });
      const pcmTransformer = new PCMInsertSilence();
      stream.pipe(decoder).pipe(pcmTransformer);
      if (mode === "opus") {
        const encoder = new prism.opus.Encoder({
          channels: 2,
          frameSize: 960,
          rate: 48_000,
        });
        pcmTransformer.pipe(encoder);
        return encoder;
      }
      return pcmTransformer;
    }
    if (mode === "pcm") {
      const decoder = new prism.opus.Decoder({
        channels: 2,
        frameSize: 960,
        rate: 48_000,
      });
      stream.pipe(decoder);
      return decoder;
    }
    return stream;
  }

  createVideoStream(user: UserResolvable, output: Writable | string) {
    const resolvedUser = this.connection.client.users.resolve(user);
    if (!resolvedUser) {
      throw new Error("VOICE_USER_MISSING");
    }
    const voiceState =
      this.connection.channel?.guild?.voiceStates?.cache?.get(
        resolvedUser.id
      ) || this.connection.client?.voiceStates?.cache?.get(resolvedUser.id);
    if (!voiceState?.streaming) {
      throw new Error("VOICE_USER_NOT_STREAMING");
    }
    const stream = this.packets.makeVideoStream(resolvedUser.id, output);
    return stream;
  }
}

export default VoiceReceiver;
export { VoiceReceiver };
