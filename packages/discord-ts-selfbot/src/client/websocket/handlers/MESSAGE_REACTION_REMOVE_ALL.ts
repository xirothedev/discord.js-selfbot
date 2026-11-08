export = (client: any, packet: any) => {
  client.actions.MessageReactionRemoveAll.handle(packet.d);
};
