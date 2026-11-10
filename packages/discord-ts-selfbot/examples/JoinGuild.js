// No longer using 2captcha since the website no longer supports hCaptcha, which Discord uses.
import Captcha from "2captcha";
import * as Discord from "../src/index";

const solver = new Captcha.Solver("<2captcha key>");

const client = new Discord.Client({
  captchaRetryLimit: 3,
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
  await client.acceptInvite("mdmc");
});

client.login("token");
