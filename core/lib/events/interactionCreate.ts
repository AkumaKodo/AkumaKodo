import { AkumaKodoBot, handleSlash } from "../AkumaKodo.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";

AkumaKodoBot.events.interactionCreate = async (_, data) => {
  await handleSlash(_ as AkumaKodoBotInterface, data);
};
