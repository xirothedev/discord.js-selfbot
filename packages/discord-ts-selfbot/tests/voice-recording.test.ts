import { expect, mock, test } from 'bun:test';
import { Buffer } from 'node:buffer';
import { EventEmitter, once } from 'node:events';
import { PassThrough, Writable } from 'node:stream';

import VoiceReceiver from '../src/client/voice/receiver/Receiver';
import Recorder from '../src/client/voice/receiver/Recorder';

const USER_ID = '900000000000000050';
const FAKE_PID = 4321;

const FFMPEG_ARGS = [
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
  '-',
  '-buffer_size',
  '4M',
  '-max_delay',
  '500000',
  '-rtbufsize',
  '4M',
  '-c',
  'copy',
  '-y',
  '-f',
  'matroska',
];

function expectedFfmpegArgs(output) {
  return [...FFMPEG_ARGS, output];
}

function createFakeChildProcess(args) {
  const stdinChunks = [];
  const stdin = new Writable({
    write(chunk, _encoding, done) {
      stdinChunks.push(Buffer.from(chunk));
      done();
    },
  });
  const stderr = new PassThrough();
  const child = new EventEmitter();
  child.pid = FAKE_PID;
  child.spawnargs = ['ffmpeg', ...args];
  child.stdin = stdin;
  child.stderr = stderr;
  child.kill = mock(() => true);
  child.stdinChunks = stdinChunks;
  return child;
}

async function buildRecorder({
  output,
  receiver = { videoStreams: new Map() },
  findProcess,
  killProcess,
  streamOutput,
} = {}) {
  let child;
  const spawn = mock((command, args) => {
    child = createFakeChildProcess(args);
    return child;
  });
  const recorder = new Recorder(receiver, {
    findProcess,
    killProcess,
    output,
    portUdpH264: 50_000,
    portUdpOpus: 50_002,
    spawn,
    streamOutput,
    userId: USER_ID,
  });

  // Let the constructor's init() pass its `await this.promise` tick and call the injected spawn.
  await Promise.resolve();
  expect(spawn).toHaveBeenCalledTimes(1);
  expect(child).toBeDefined();

  const ready = once(recorder, 'ready');
  child.stderr.write('ffmpeg is ready');
  await ready;

  return { child, recorder, spawn };
}

test('Recorder builds the expected ffmpeg arguments for an audio output', async () => {
  const output = '/tmp/voice-recording-audio.mka';
  const { recorder, child, spawn } = await buildRecorder({ output });

  expect(spawn).toHaveBeenCalledTimes(1);
  const [[command, args]] = spawn.mock.calls;
  expect(command).toBe('ffmpeg');
  expect(args).toEqual(expectedFfmpegArgs(output));

  expect(child.stdinChunks.join('')).toContain('m=audio 50002 RTP/AVP');
  expect(recorder.portUdpH264).toBe(50_000);
  expect(recorder.portUdpOpus).toBe(50_002);
  expect(recorder.ready).toBe(true);

  recorder.stop();
});

test('Recorder builds the expected ffmpeg arguments for a video output', async () => {
  const output = '/tmp/voice-recording-video.mkv';
  const { recorder, spawn } = await buildRecorder({ output });

  const [[command, args]] = spawn.mock.calls;
  expect(command).toBe('ffmpeg');
  expect(args).toEqual(expectedFfmpegArgs(output));

  recorder.stop();
});

test('Recorder#stop ends the ffmpeg process and flushes the output stream', async () => {
  let finalized = false;
  const output = new Writable({
    final(done) {
      finalized = true;
      done();
    },
    write(_chunk, _encoding, done) {
      done();
    },
  });
  const streamOutput = mock(() => ({ url: 'unix:/tmp/fake-recorder.sock' }));
  const { recorder, child } = await buildRecorder({ output, streamOutput });

  expect(streamOutput).toHaveBeenCalledWith(output);
  expect(child.spawnargs.at(-1)).toBe('unix:/tmp/fake-recorder.sock');

  const closed = once(recorder, 'closed');
  const finished = once(output, 'finish');
  recorder.stop();
  await closed;
  await finished;

  expect(child.kill).toHaveBeenCalledTimes(1);
  expect(child.stdin.writableEnded).toBe(true);
  expect(output.writableEnded).toBe(true);
  expect(finalized).toBe(true);
});

test('Recorder#destroy routes find-process and tree-kill through the injectable seam', async () => {
  const receiver = { videoStreams: new Map([[USER_ID, {}]]) };
  const findProcess = mock(async () => [{ pid: FAKE_PID }]);
  const killProcess = mock(() => {});
  const { recorder } = await buildRecorder({
    findProcess,
    killProcess,
    output: '/tmp/voice-recording-video.mkv',
    receiver,
  });

  const closed = once(recorder, 'closed');
  recorder.destroy();
  await closed;

  expect(findProcess).toHaveBeenCalledWith('name', 'ffmpeg', true);
  expect(killProcess).toHaveBeenCalledWith(FAKE_PID);
  expect(receiver.videoStreams.has(USER_ID)).toBe(false);
  expect(recorder.findProcess).toBe(findProcess);
  expect(recorder.killProcess).toBe(killProcess);
});

test('VoiceReceiver#createVideoStream throws when the user is not streaming', () => {
  const user = { id: USER_ID };
  const voiceStates = { cache: new Map([[USER_ID, { streaming: false }]]) };
  const connection = {
    channel: { guild: { voiceStates } },
    client: {
      users: { resolve: () => user },
      voiceStates,
    },
  };
  const receiver = new VoiceReceiver(connection);

  let thrown;
  try {
    receiver.createVideoStream(user, '/tmp/voice-recording-video.mkv');
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeDefined();
  expect(thrown.code).toBe('VOICE_USER_NOT_STREAMING');
  expect(thrown.message).toBe('User is not streaming');
  expect(receiver.packets.videoStreams.size).toBe(0);
});
