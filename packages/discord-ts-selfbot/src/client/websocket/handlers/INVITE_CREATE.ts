export = (client: any, packet: any) => {
  client.actions.InviteCreate.handle(packet.d);
};
