export = (client: any, packet: any) => {
  client.actions.PresenceUpdate.handle(packet.d);
};
