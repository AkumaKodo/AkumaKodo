import { AkumaKodoBot, createAkumaKodoBot } from "../packages/core/lib/AkumaKodo.ts";
import { AkumaKodoBotInterface } from "../packages/core/interfaces/Client.ts";

// testing bot function
await createAkumaKodoBot(AkumaKodoBot, {
  botId: 1n,
  token: "",
  intents: [],
  events: {},
});

// testing custom bot function extension

interface newBotExtension extends AkumaKodoBotInterface {
  custom_something: string;
}

const newBot = AkumaKodoBot as newBotExtension;

newBot.custom_something = "test";
