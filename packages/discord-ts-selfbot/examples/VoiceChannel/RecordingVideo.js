// https://v12.discordjs.guide/voice/receiving-audio.html#basic-usage

/*
Install:
- An Opus library: @discordjs/opus or opusscript
- An encryption packages:
  + sodium (best performance)
  + libsodium-wrappers
  + @stablelib/xchacha20poly1305
- ffmpeg (install and add to your system environment)
*/

import fs from "node:fs";
import { Client } from "../../src/index";

const client = new Client();

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);

  const channel = client.channels.cache.get("voice_id");
  const connection = await client.voice.joinChannel(channel, {
    selfDeaf: true,
    selfMute: true,
    selfVideo: false,
  });

  const connectionStream = await connection.joinStreamConnection("user_id");

  // Output file using matroska container
  const video = connectionStream.receiver.createVideoStream(
    "user_id",
    fs.createWriteStream("video.mkv")
  );

  video.on("ready", () => {
    console.log("FFmpeg process ready!");
    video.stream.stderr.on("data", (data) => {
      console.log(`FFmpeg: ${data}`);
    });
  });

  // After 15s
  setTimeout(() => {
    video.destroy();
  }, 15_000);
});

client.login("token");
