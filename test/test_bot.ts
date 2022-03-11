import { AkumaKomoBot, createAkumaKomoBot } from "../packages/core/lib/mod.ts";

createAkumaKomoBot(AkumaKomoBot, {
  botId: 1n,
  token: "",
  intents: [],
  events: {},
}).then(() => {
  console.log("Bot created!");
});
