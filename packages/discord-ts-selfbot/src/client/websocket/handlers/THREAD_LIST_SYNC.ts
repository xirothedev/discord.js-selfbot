export = (client: any, packet: any) => {
  client.actions.ThreadListSync.handle(packet.d);
};
