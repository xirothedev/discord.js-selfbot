export = (client: any, packet: any) => {
  client.actions.MessageDeleteBulk.handle(packet.d);
};
