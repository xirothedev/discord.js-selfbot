export = (client: any, packet: any) => {
  client.actions.MessagePollVoteAdd.handle(packet.d);
};
