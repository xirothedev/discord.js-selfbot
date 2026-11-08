export = (client: any, packet: any, shard: any) => {
  client.actions.GuildMemberUpdate.handle(packet.d, shard);
};
