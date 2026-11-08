export = (client: any, packet: any) => {
  client.actions.ThreadDelete.handle(packet.d);
};
