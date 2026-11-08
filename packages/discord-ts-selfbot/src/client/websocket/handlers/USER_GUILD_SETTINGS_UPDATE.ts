export = (client: any, { d: data }: any) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (guild) guild?.settings._patch(data);
};
