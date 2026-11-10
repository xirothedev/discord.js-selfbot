import { Client, MessageAttachment } from "../src/index";

const client = new Client();

client.on("ready", () => {
  console.log(`${client.user.username} is ready!`);
  const channel = client.channels.cache.get("channel_id");
  const attachment = new MessageAttachment(
    // path file
    "./test.mp3",
    // must be .ogg
    "random_file_name.ogg",
    {
      // any number you want
      duration_secs: 1,
      waveform: "AAAAAAAAAAAA",
    }
  );
  channel.send({
    files: [attachment],
    flags: "IS_VOICE_MESSAGE",
  });
});

client.login("token");
