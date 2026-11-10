import { Client, CustomStatus, RichPresence, SpotifyRPC } from "../src/index";

const client = new Client();

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);
  // The last argument is required if the image you use is not in Discord
  const getExtendURL = await RichPresence.getExternal(
    client,
    "367827983903490050",
    "https://assets.ppy.sh/beatmaps/1550633/covers/list.jpg"
  );
  const status = new RichPresence(client)
    .setApplicationId("367827983903490050")
    .setType("PLAYING")
    // If you set a URL, it will automatically change to STREAMING type
    .setURL("https://www.youtube.com/watch?v=5icFcPkVzMg")
    .setState("Arcade Game")
    .setName("osu!")
    .setDetails("MariannE - Yooh")
    .setParty({
      current: 1,
      max: 8,
    })
    .setStartTimestamp(Date.now())
    // https://assets.ppy.sh/beatmaps/1550633/covers/list.jpg
    .setAssetsLargeImage(getExtendURL[0].external_asset_path)
    .setAssetsLargeText("Idle")
    // https://discord.com/api/v9/oauth2/applications/367827983903490050/assets
    .setAssetsSmallImage("373370493127884800")
    .setAssetsSmallText("click the circles")
    .setPlatform("desktop")
    .addButton("Beatmap", "https://osu.ppy.sh/beatmapsets/1391659#osu/2873429");
  // Custom Status
  const custom = new CustomStatus(client).setEmoji("😋").setState("yum");
  // Spotify
  const spotify = new SpotifyRPC(client)
    // Image ID
    .setAssetsLargeImage("spotify:ab67616d00001e02768629f8bc5b39b68797d1bb")
    // Image ID
    .setAssetsSmallImage("spotify:ab6761610000f178049d8aeae802c96c8208f3b7")
    // Album Name
    .setAssetsLargeText("未来茶屋 (vol.1)")
    // Artists
    .setState("Yunomi; Kizuna AI")
    // Song name
    .setDetails("ロボットハート")
    .setStartTimestamp(Date.now())
    // Song length = 2m56s
    .setEndTimestamp(Date.now() + 1000 * (2 * 60 + 56))
    // Song ID
    .setSongId("667eE4CFfNtJloC6Lvmgrx")
    // Album ID
    .setAlbumId("6AAmvxoPoDbJAwbatKwMb9")
    // Artist IDs
    .setArtistIds("2j00CVYTPx6q9ANbmB2keb", "2nKGmC5Mc13ct02xAY8ccS");

  client.user.setPresence({ activities: [status, custom, spotify] });
});

client.login("token");
