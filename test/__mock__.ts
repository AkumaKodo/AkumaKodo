import {AkumaKodoBotCore} from "../core/lib/AkumaKodo.ts";

const Bot = new AkumaKodoBotCore({
  botId: 946398697254703174n,
  dir: "",
  events: {},
  intents: ["Guilds"],
  optional: {
    bot_internal_logs: true,
  },
  token: "OTQ2Mzk4Njk3MjU0NzAzMTc0.YheIeA.tWtFnFKkSKcxUeTi1-f588Khch0",
});

await Bot.createBot();
