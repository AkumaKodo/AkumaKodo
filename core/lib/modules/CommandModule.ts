import { AkumaCreateBotOptions } from "../../interfaces/Client.ts";
import { AkumaKodoModule } from "./mod.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";

export class AkumaKodoCommandModule extends AkumaKodoModule {
  public constructor(config: AkumaCreateBotOptions) {
    super(config);
  }

  /**
   * Creates a new command in the cache. This is used to preload commands
   * @param command
   */
  public createCommand(command: AkumaKodoCommand) {
    this;
  }
}
