import { spawn as spawnProcess } from 'child_process';
import { createSocket } from 'dgram';
import { EventEmitter } from 'events';
import { Buffer } from 'node:buffer';
import { Writable } from 'stream';
import findProcessDefault from 'find-process';
import killProcessDefault from 'tree-kill';
import { RtpPacket } from 'werift-rtp';
import VoiceCodec from '../util/VoiceCodec';
import _FunctionModule from '../util/Function';
const { randomPorts } = _FunctionModule;
import _SocketModule from '../util/Socket';
const { StreamOutput } = _SocketModule;

/**
 * Represents a FFmpeg handler
 * @extends {EventEmitter}
 */
class Recorder extends EventEmitter {
  [key: string]: any;

  constructor(
    receiver: any,
    {
      userId,
      portUdpH264,
      portUdpOpus,
      output,
      spawn = spawnProcess,
      findProcess = findProcessDefault,
      killProcess = killProcessDefault,
      streamOutput = StreamOutput,
    }: any = {},
  ) {
    super();

    Object.defineProperty(this, 'receiver', { value: receiver });

    // Process and filesystem boundaries are injectable so tests never spawn ffmpeg or touch the OS.
    this.spawn = spawn;
    this.findProcess = findProcess;
    this.killProcess = killProcess;
    this.streamOutput = streamOutput;

    /**
     * The user ID
     * @type {Snowflake}
     */
    this.userId = userId;

    this.portUdpH264 = portUdpH264;
    this.portUdpH265 = null;
    this.portUdpOpus = portUdpOpus;

    this.promise = null;

    if (!portUdpH264 || !portUdpOpus) {
      this.promise = randomPorts(6, 'udp4').then((ports: any) => {
        ports = ports.filter((port: any) => port % 2 === 0);
        this.portUdpH264 ??= ports[0];
        this.portUdpOpus ??= ports[1];
      });
    }

    /**
     * The output of the stream
     * @type {string|Readable}
     */
    this.output = output;

    /**
     * The FFmpeg process is ready or not
     * @type {boolean}
     */
    this.ready = false;

    this.socket = createSocket('udp4');

    this.init(output);
  }
  async init(output: any) {
    await this.promise;
    const sdpData = VoiceCodec.getSDPCodecName(this.portUdpH264, this.portUdpH265, this.portUdpOpus);
    const isStream = output instanceof Writable;
    if (isStream) {
      this.outputStream = this.streamOutput(output);
    }
    const stream = this.spawn('ffmpeg', [
      '-reorder_queue_size',
      '500',
      '-thread_queue_size',
      '500',
      '-err_detect',
      'ignore_err',
      '-flags2',
      '+export_mvs',
      '-fflags',
      '+genpts+discardcorrupt',
      '-use_wallclock_as_timestamps',
      '1',
      '-f',
      'sdp',
      '-analyzeduration',
      '1M',
      '-probesize',
      '1M',
      '-protocol_whitelist',
      'file,udp,rtp,pipe,fd',
      '-i',
      '-', // Read from stdin
      '-buffer_size',
      '4M',
      '-max_delay',
      '500000', // 500ms
      '-rtbufsize',
      '4M',
      '-c',
      'copy',
      '-y',
      '-f',
      'matroska',
      isStream ? this.outputStream.url : output,
    ]);

    /**
     * The FFmpeg process
     * @type {ChildProcessWithoutNullStreams}
     */
    this.stream = stream;
    this.stream.stdin.write(sdpData);
    this.stream.stdin.end();
    this.stream.stderr.once('data', (data: any) => {
      this.emit('debug', `stderr: ${data}`);
      this.ready = true;
      this.emit('ready');
    });
  }
  /**
   * Send a payload to FFmpeg via UDP
   * @param {RtpPacket|string|Buffer} payload The payload
   * @param {*} callback Callback
   */
  feed(
    payload: any,
    callback: any = (e: any) => {
      if (e) {
        console.error('Error sending packet:', e);
      }
    },
  ) {
    if (!(payload instanceof RtpPacket)) {
      payload = RtpPacket.deSerialize(Buffer.isBuffer(payload) ? payload : Buffer.from(payload));
    }
    const message = payload.serialize();
    // Get port from payloadType
    let port;
    if (payload.header.payloadType === VoiceCodec.getPayloadType('opus')) {
      port = this.portUdpOpus;
    } else if (payload.header.payloadType === VoiceCodec.getPayloadType('H264')) {
      port = this.portUdpH264;
    } else if (payload.header.payloadType === VoiceCodec.getPayloadType('H265')) {
      port = this.portUdpH265;
    } else {
      return;
    }
    this.socket.send(message, 0, message.length, port, '127.0.0.1', callback);
  }

  /**
   * Stops FFmpeg and flushes the recording output.
   */
  stop() {
    if (!this.stream) return;
    this.stream.stdin.end();
    this.stream.kill();
    if (this.output instanceof Writable) this.output.end();
    this.receiver?.videoStreams?.delete(this.userId);
    this.emit('closed');
  }

  destroy() {
    const ffmpegPid = this.stream.pid; // But it is ppid ;-;
    const args = this.stream.spawnargs.slice(1).join(' '); // Skip ffmpeg
    this.findProcess('name', 'ffmpeg', true).then((list: any) => {
      let process = list.find((o: any) => o.pid === ffmpegPid || o.ppid === ffmpegPid || o.cmd.includes(args));
      if (process) {
        this.killProcess(process.pid);
        this.receiver?.videoStreams?.delete(this.userId);
        this.emit('closed');
      }
    });
  }

  /**
   * Emitted when the Recorder becomes ready to start working.
   * @event Recorder#ready
   */

  /**
   * Emitted when the Recorder is closed.
   * @event Recorder#closed
   */
}

export default Recorder;
export { Recorder };
