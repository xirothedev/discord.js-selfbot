export = (client: any, packet: any) => {
  client.actions.MessageReactionAdd.handle(packet.d);
};
