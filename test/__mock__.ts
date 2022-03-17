import { AkumaKodoBotCore } from "../core/AkumaKodo.ts";

import { dotEnvConfig } from "../deps.ts";
const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

const Bot = new AkumaKodoBotCore({
  botId: 946398697254703174n,
  events: {},
  intents: ["Guilds", "GuildMessages", "GuildMembers"],
  optional: {
    bot_debug_mode: true,
  },
  token: TOKEN,
  providers: {
    type: "disabled",
  },
});

await Bot.createBot();

Bot.instance.events.messageCreate = async (bot, payload) => {
  Bot.container.logger.create("info", "messageCreate", payload.content);
  if (payload.content === "!ping") {
    await Bot.instance.helpers.sendMessage(payload.channelId, {
      content: "pong!",
    });
    Bot.container.logger.create("info", "messageCreate", `Ping command ran in ${payload.channelId}`);
  }
};

Bot.instance.events.ready = (_, payload) => {
  Bot.container.logger.create("info", "ready", "Online and ready to work!");
};
