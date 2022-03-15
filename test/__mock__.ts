import { AkumaKodoBotCore } from "../core/lib/AkumaKodo.ts";

import { dotEnvConfig } from "../deps.ts";
const env = dotEnvConfig({ export: true });
const token = env.DISCORD_BOT_TOKEN || "";

const Bot = new AkumaKodoBotCore({
  botId: 946398697254703174n,
  dir: "",
  events: {},
  intents: ["Guilds"],
  optional: {
    bot_internal_logs: true,
  },
  token: token,
});

await Bot.createBot();
