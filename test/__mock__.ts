import { AkumaKodoBotCore } from "../core/lib/AkumaKodo.ts";

import { dotEnvConfig } from "../deps.ts";
const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

const Bot = new AkumaKodoBotCore({
  botId: 946398697254703174n,
  events: {},
  intents: ["Guilds", "GuildMessages", "GuildMembers"],
  optional: {
    bot_internal_logs: true,
  },
  token: TOKEN,
});

await Bot.createBot();

Bot.client.events.messageCreate = (_, payload) => {
  Bot.container.logger.create("info", "messageCreate", payload.content);
};

Bot.client.events.ready = (_, payload) => {
  Bot.container.logger.create("info", "ready", "Online and ready to work!");
};

Bot.container.utils.createTask(Bot, {
  name: "reminder",
  interval: 10 * 1000,
  execute: () => {
    Bot.container.logger.create("info", "createTask", "This will be executed every 10 seconds!");
  },
})
