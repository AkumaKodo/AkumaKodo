import { BotWithCache } from "../../../deps.ts";
import { AkumaKodoConfigurationInterface, AkumaKodoContainerInterface } from "../../interfaces/Client.ts";

/**
 * Custom module class for developers to extend and add their own properties and methods.
 * Simply import it into your project and get developing!
 */
export class AkumaKodoCustomModule {
  public container: AkumaKodoContainerInterface;
  public configuration: AkumaKodoConfigurationInterface;
  private readonly instance: BotWithCache;

  public constructor(
    bot: BotWithCache,
    container: AkumaKodoContainerInterface,
    config: AkumaKodoConfigurationInterface,
  ) {
    this.container = container;
    this.configuration = config;
    this.instance = bot;
    this.onLoad();
  }

  protected onLoad(): void {
    this.container.logger.debug("info", "CustomModule", "Custom module loaded!");
  }
}
