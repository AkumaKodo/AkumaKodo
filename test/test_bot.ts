import { AkumaKomoBot, createAkumaKomoBot } from "../packages/core/lib/AkumaKodo.ts";
import { AkumaKomoBotInterface } from "../packages/core/interfaces/Client.ts";

// testing bot function
await createAkumaKomoBot(AkumaKomoBot, {
  botId: 1n,
  token: "",
  intents: [],
  events: {},
});

// testing custom bot function extension

interface newBotExtension extends AkumaKomoBotInterface {
  custom_something: string;
}

const newBot = AkumaKomoBot as newBotExtension;

newBot.custom_something = "test";
