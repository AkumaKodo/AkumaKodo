import { AkumaKodoBotCore } from "../../AkumaKodo.ts";
import { AkumaKodoController } from "../../AkumaKodoController.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import { AkumaKodoInhibitor } from "./mod.ts";
import { DiscordenoMessage } from "https://deno.land/x/discordeno@13.0.0-rc18/src/transformers/message.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";

export class AkumaKodoInhibitorController<T extends AkumaKodoBotCore> extends AkumaKodoController<T> {
  declare pool: AkumaKodoCollection<string, AkumaKodoInhibitor>;
  protected dir: string;

  constructor(client: T, dir: string) {
    super(client, dir);
    this.dir = dir;
    this.pool = new AkumaKodoCollection();
  }

  async runChecks(message: DiscordenoMessage, command: AkumaKodoCommand): Promise<boolean> {
    const inhibitors = [...this.pool.entries()].sort((a, b) => b[1].priority - a[1].priority);
    for await (const [, inhibitor] of inhibitors) {
      if (await inhibitor.execute(message, command)) return true;
    }
    return false;
  }
}
