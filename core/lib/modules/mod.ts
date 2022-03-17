import { AkumaKodoBotCore } from "../../AkumaKodo.ts";
import { AkumaCreateBotOptions } from "../../interfaces/Client.ts";
import { BotWithCache } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/src/addCacheCollections.ts";

export class AkumaKodoModule extends AkumaKodoBotCore {
  protected internal: BotWithCache;
  public constructor(bot: BotWithCache, config: AkumaCreateBotOptions) {
    super(config);
    this.internal = bot;
    this.onLoad();
  }

  protected onLoad(): void {
    this.container.logger.create("info", "AkumaKodo Module", "AkumaKodoModule has been initialized.");
  }
}
