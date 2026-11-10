const { Client } = require("../src/index");

const client = new Client();

client.on("ready", () => {
  console.log(`${client.user.username} is ready!`);
  const channel = client.channels.cache.get("id");
  channel.send({
    activity: {
      partyId: `spotify:${client.user.id}`,
      type: 3, // MessageActivityType.Listen,
    },
  });
});

client.login("token");
