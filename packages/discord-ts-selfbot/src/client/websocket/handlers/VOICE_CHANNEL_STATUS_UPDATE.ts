import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, { d: data }: any) => {
  const channel = client.channels.cache.get(data.id);
  if (channel) {
    const old = channel._clone();
    channel.status = data.status;
    client.emit(Events.CHANNEL_UPDATE, old, channel);
  }
};
