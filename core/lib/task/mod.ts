import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";
import { AkumaKodoTask } from "../../interfaces/Task.ts";

export function createAkumaTask(bot: AkumaKodoBotInterface, task: AkumaKodoTask) {
  bot.taskCollection.set(task.name, task);
}
