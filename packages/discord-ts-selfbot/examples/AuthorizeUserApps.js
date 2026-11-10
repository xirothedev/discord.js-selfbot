import * as Discord from '../src/index';

const client = new Discord.Client();

client.on('ready', async () => {
  console.log('Ready!', client.user.tag);
  // Midjourney
  await client.installUserApps('936929561302675456');
});

client.login('token');
