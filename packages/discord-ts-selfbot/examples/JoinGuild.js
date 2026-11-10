"use strict";

// No longer using 2captcha since the website no longer supports hCaptcha, which Discord uses.
const Captcha = require("2captcha");
const Discord = require("../src/index");

const solver = new Captcha.Solver("<2captcha key>");

const client = new Discord.Client({
  captchaRetryLimit: 3,
  captchaSolver(captcha, UA) {
    return solver
      .hcaptcha(captcha.captcha_sitekey, "discord.com", {
        invisible: 1,
        userAgent: UA,
        data: captcha.captcha_rqdata,
      })
      .then((res) => res.data);
  },
});

client.on("ready", async () => {
  console.log("Ready!", client.user.tag);
  await client.acceptInvite("mdmc");
});

client.login("token");
