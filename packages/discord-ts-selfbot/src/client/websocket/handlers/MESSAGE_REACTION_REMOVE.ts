export = (client: any, packet: any) => {
  client.actions.MessageReactionRemove.handle(packet.d);
};
