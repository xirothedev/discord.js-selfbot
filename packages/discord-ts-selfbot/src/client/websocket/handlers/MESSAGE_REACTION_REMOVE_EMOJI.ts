export = (client: any, packet: any) => {
  client.actions.MessageReactionRemoveEmoji.handle(packet.d);
};
