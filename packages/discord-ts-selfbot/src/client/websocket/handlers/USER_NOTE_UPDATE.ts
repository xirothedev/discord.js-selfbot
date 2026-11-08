export = (client: any, { d: data }: any) => {
  client.notes.cache.set(data.id, data.note);
};
