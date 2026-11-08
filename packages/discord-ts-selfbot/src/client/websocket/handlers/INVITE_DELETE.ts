export = (client: any, packet: any) => {
  client.actions.InviteDelete.handle(packet.d);
};
