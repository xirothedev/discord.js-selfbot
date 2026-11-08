const { Events } = require('../../../util/Constants');
export = (client: any, { d: data }: any) => {
  const channel = client.channels.cache.get(data.id);
  if (channel) {
    const old = channel._clone();
    channel.status = data.status;
    client.emit(Events.CHANNEL_UPDATE, old, channel);
  }
};
