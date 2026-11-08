export = (client: any, packet: any) => {
  client.actions.ThreadMemberUpdate.handle(packet.d);
};
