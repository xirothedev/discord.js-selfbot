export = (client: any, { d: data }: any) => {
  client.settings._patch(data);
};
