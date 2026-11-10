import { spawn as spawnProcess } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createSocket } from "node:dgram";
import { EventEmitter } from "node:events";
import { Buffer } from "node:buffer";
import { Writable } from "node:stream";
import findProcessDefault from "find-process";
import killProcessDefault from "tree-kill";
import { RtpPacket } from "werift-rtp";
import VoiceCodec from "../util/VoiceCodec";
import _FunctionModule from "../util/Function";

const { randomPorts } = _FunctionModule;
import _SocketModule from "../util/Socket";
import type PacketHandler from "./PacketHandler";
import type { Socket } from "dgram";
import type { UnixStream } from "../util/Socket";

const { StreamOutput } = _SocketModule;

interface RecorderOptions {
  userId: string;
  portUdpH264?: number;
  portUdpOpus?: number;
  output: string | Writable;
  spawn?: typeof spawnProcess;
  findProcess?: typeof findProcessDefault;
  killProcess?: typeof killProcessDefault;
  streamOutput?: typeof StreamOutput;
}

class Recorder extends EventEmitter {
  declare receiver: PacketHandler;
  declare spawn: typeof spawnProcess;
  declare findProcess: typeof findProcessDefault;
  declare killProcess: typeof killProcessDefault;
  declare streamOutput: typeof StreamOutput;
  declare userId: string;
  declare portUdpH264: number | null;
  declare portUdpH265: number | null;
  declare portUdpOpus: number | null;
  declare promise: Promise<void> | null;
  declare output: string | Writable;
  declare ready: boolean;
  declare socket: Socket;
  declare outputStream: UnixStream | null;
  declare stream: ChildProcessWithoutNullStreams | null;

  constructor(
    receiver: PacketHandler,
    {
      userId,
      portUdpH264,
      portUdpOpus,
      output,
      spawn = spawnProcess,
      findProcess = findProcessDefault,
      killProcess = killProcessDefault,
      streamOutput = StreamOutput,
    }: RecorderOptions
  ) {
    super();

    Object.defineProperty(this, "receiver", { value: receiver });

    // Process and filesystem boundaries are injectable so tests never spawn ffmpeg or touch the OS.
    this.spawn = spawn;
    this.findProcess = findProcess;
    this.killProcess = killProcess;
    this.streamOutput = streamOutput;

    this.userId = userId;

    this.portUdpH264 = portUdpH264 ?? null;
    this.portUdpH265 = null;
    this.portUdpOpus = portUdpOpus ?? null;

    this.promise = null;

    if (!portUdpH264 || !portUdpOpus) {
      this.promise = randomPorts(6, "udp4").then((ports) => {
        const evenPorts = ports.filter(
          (port): port is number => typeof port === "number" && port % 2 === 0
        );
        this.portUdpH264 ??= evenPorts[0] ?? null;
        this.portUdpOpus ??= evenPorts[1] ?? null;
      });
    }

    this.output = output;

    this.ready = false;

    this.socket = createSocket("udp4");

    this.init(output);
  }
  async init(output: string | Writable) {
    await this.promise;
    const sdpData = VoiceCodec.getSDPCodecName(
      this.portUdpH264,
      this.portUdpH265,
      this.portUdpOpus
    );
    const isStream = output instanceof Writable;
    if (isStream) {
      this.outputStream = this.streamOutput(output);
    }
    const stream = this.spawn("ffmpeg", [
      "-reorder_queue_size",
      "500",
      "-thread_queue_size",
      "500",
      "-err_detect",
      "ignore_err",
      "-flags2",
      "+export_mvs",
      "-fflags",
      "+genpts+discardcorrupt",
      "-use_wallclock_as_timestamps",
      "1",
      "-f",
      "sdp",
      "-analyzeduration",
      "1M",
      "-probesize",
      "1M",
      "-protocol_whitelist",
      "file,udp,rtp,pipe,fd",
      "-i",
      "-", // Read from stdin
      "-buffer_size",
      "4M",
      "-max_delay",
      "500000", // 500ms
      "-rtbufsize",
      "4M",
      "-c",
      "copy",
      "-y",
      "-f",
      "matroska",
      isStream ? this.outputStream!.url : output,
    ]);

    this.stream = stream;
    this.stream.stdin.write(sdpData);
    this.stream.stdin.end();
    this.stream.stderr.once("data", (data: Buffer) => {
      this.emit("debug", `stderr: ${data}`);
      this.ready = true;
      this.emit("ready");
    });
  }
  feed(
    payload: RtpPacket | string | Buffer,
    callback: (error?: Error | null) => void = (error) => {
      if (error) {
        console.error("Error sending packet:", error);
      }
    }
  ) {
    const packet =
      payload instanceof RtpPacket
        ? payload
        : RtpPacket.deSerialize(
            Buffer.isBuffer(payload) ? payload : Buffer.from(payload)
          );
    const message = packet.serialize();
    // Get port from payloadType
    let port: number | null | undefined;
    if (packet.header.payloadType === VoiceCodec.getPayloadType("opus")) {
      port = this.portUdpOpus;
    } else if (
      packet.header.payloadType === VoiceCodec.getPayloadType("H264")
    ) {
      port = this.portUdpH264;
    } else if (
      packet.header.payloadType === VoiceCodec.getPayloadType("H265")
    ) {
      port = this.portUdpH265;
    } else {
      return;
    }
    if (!port) {
      return;
    }
    this.socket.send(message, 0, message.length, port, "127.0.0.1", callback);
  }

  stop() {
    if (!this.stream) {
      return;
    }
    this.stream.stdin.end();
    this.stream.kill();
    if (this.output instanceof Writable) {
      this.output.end();
    }
    this.receiver?.videoStreams?.delete(this.userId);
    this.emit("closed");
  }

  destroy() {
    if (!this.stream) {
      return;
    }
    const ffmpegPid = this.stream.pid; // But it is ppid ;-;
    const args = this.stream.spawnargs.slice(1).join(" "); // Skip ffmpeg
    this.findProcess("name", "ffmpeg", true).then((list) => {
      const process = list.find(
        (o) =>
          o.pid === ffmpegPid || o.ppid === ffmpegPid || o.cmd.includes(args)
      );
      if (process) {
        this.killProcess(process.pid);
        this.receiver?.videoStreams?.delete(this.userId);
        this.emit("closed");
      }
    });
  }
}

export default Recorder;
export { Recorder };
