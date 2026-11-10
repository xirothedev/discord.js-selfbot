// Join a channel and play music, like a Discord bot.

/*
Install:
- An Opus library: @discordjs/opus or opusscript
- An encryption packages:
  + sodium (best performance)
  + libsodium-wrappers
  + @stablelib/xchacha20poly1305
- ffmpeg (install and add to your system environment)
*/

import ytdl from '@distube/ytdl-core';
import { Client } from '../../src/index';

const client = new Client();

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
  const channel = client.channels.cache.get('voice_id');
  const connection = await client.voice.joinChannel(channel, {
    selfDeaf: true,
    selfMute: true,
    selfVideo: false,
  });
  const dispatcher = connection.playAudio(
    ytdl('https://www.youtube.com/watch?v=3KadWjpqDXs', {
      quality: 'highestaudio',
    })
  );
  dispatcher.on('start', () => {
    console.log('audio is now playing!');
    // pause
    console.log('paused');
    dispatcher.pause();
    // resume
    setTimeout(() => {
      console.log('resumed');
      dispatcher.resume();
    }, 5000);

    // Set volume
    dispatcher.setVolume(0.5);
    console.log('50% volume');
  });

  dispatcher.on('finish', () => {
    console.log('audio has finished playing!');
  });
  dispatcher.on('error', console.error);
  // Leave voice
  setTimeout(() => {
    console.log('disconnected');
    connection.disconnect();
  }, 30_000);
});

client.login('token');
