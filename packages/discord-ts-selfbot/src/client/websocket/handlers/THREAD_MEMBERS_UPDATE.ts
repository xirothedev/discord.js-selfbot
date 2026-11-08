export = (client: any, packet: any) => {
  client.actions.ThreadMembersUpdate.handle(packet.d);
};
