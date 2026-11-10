// No longer using 2captcha since the website no longer supports hCaptcha, which Discord uses.
import Captcha from "2captcha";
import * as Discord from "../src/index";

const solver = new Captcha.Solver("<2captcha key>");

const client = new Discord.Client({
  TOTPKey: "<string>",
  captchaSolver(captcha, UA) {
    return solver
      .hcaptcha(captcha.captcha_sitekey, "discord.com", {
        data: captcha.captcha_rqdata,
        invisible: 1,
        userAgent: UA,
      })
      .then((res) => res.data);
  },
});

client.on("ready", async () => {
  console.log("Ready!", client.user.tag);
  // Note
  // You need to include `guild_id` to invite the bot
  // These two fields can appear either in the URL or in the options.
  await client.authorizeURL(
    `https://discord.com/api/oauth2/authorize?client_id=289066747443675143&permissions=414501424448&scope=bot%20applications.commands`,
    {
      guild_id: "guild id",
    }
  );
});

client.login("token");
