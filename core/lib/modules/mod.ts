import { AkumaKodoBotCore } from "../../AkumaKodo.ts";
import { AkumaCreateBotOptions } from "../../interfaces/Client.ts";
import { BotWithCache } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/src/addCacheCollections.ts";

export class AkumaKodoModule extends AkumaKodoBotCore {
  public constructor(config: AkumaCreateBotOptions) {
    super(config);
    this.onLoad();
  }

  protected onLoad(): void {
    this.container.logger.create("info", "AkumaKodo Module", "AkumaKodoModule has been initialized.");
  }
}
