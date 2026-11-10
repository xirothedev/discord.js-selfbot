const { Client, MessageAttachment } = require("../src/index");

const client = new Client();

client.on("ready", () => {
  console.log(`${client.user.username} is ready!`);
  const channel = client.channels.cache.get("channel_id");
  const attachment = new MessageAttachment(
    "./test.mp3", // path file
    "random_file_name.ogg", // must be .ogg
    {
      duration_secs: 1, // any number you want
      waveform: "AAAAAAAAAAAA",
    }
  );
  channel.send({
    files: [attachment],
    flags: "IS_VOICE_MESSAGE",
  });
});

client.login("token");
