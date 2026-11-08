export = (client: any, packet: any) => {
  client.actions.MessagePollVoteRemove.handle(packet.d);
};
