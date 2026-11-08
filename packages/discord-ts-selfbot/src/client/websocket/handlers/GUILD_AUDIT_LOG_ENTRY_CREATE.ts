export = (client: any, packet: any) => {
  client.actions.GuildAuditLogEntryCreate.handle(packet.d);
};
