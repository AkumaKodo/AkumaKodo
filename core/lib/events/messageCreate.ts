import { AkumaKodoBot, handleMessageCommands } from "../AkumaKodo.ts";
import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";

AkumaKodoBot.events.messageCreate = async (_, data) => {
  await handleMessageCommands(_ as AkumaKodoBotInterface, data);
};
