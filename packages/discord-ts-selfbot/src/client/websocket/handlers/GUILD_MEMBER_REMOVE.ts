export = (client: any, packet: any, shard: any) => {
  client.actions.GuildMemberRemove.handle(packet.d, shard);
};
