"use strict";

const Discord = require("../src/index");
const { ProxyAgent } = require("proxy-agent");

const proxy = new ProxyAgent({
  getProxyForUrl() {
    return "<any proxy>";
  },
});

const client = new Discord.Client({
  http: {
    // API Proxy
    // Read more: https://github.com/nodejs/undici/blob/main/docs/docs/api/ProxyAgent.md
    // agent: ProxyAgentOptions
    agent: "my.proxy.server",
    // or new URL('my.proxy.server')
    // or { uri: 'my.proxy.server' }
  },
  ws: {
    agent: proxy, // WebSocket Proxy
    // Do not use the `proxy` option if you don't need to use the WebSocket Proxy
  },
});

// So if you only need to use the API Proxy (for the purpose of saving data), you don't need to install `proxy-agent`.

client.on("ready", () => {
  console.log("Ready!", client.user.tag);
});

client.login("token");
