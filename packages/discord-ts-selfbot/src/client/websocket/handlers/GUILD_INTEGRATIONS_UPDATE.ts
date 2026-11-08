export = (client: any, packet: any) => {
  client.actions.GuildIntegrationsUpdate.handle(packet.d);
};
