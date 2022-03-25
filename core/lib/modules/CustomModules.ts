import { BotWithCache } from "../../../deps.ts";
import {
    AkumaKodoConfigurationInterface,
    AkumaKodoContainerInterface,
} from "../../interfaces/Client.ts";

/**
 * Custom module class for developers to extend and add their own properties and methods.
 * Simply import it into your project and get developing!
 */
export class AkumaKodoCustomModule {
    public container: AkumaKodoContainerInterface;
    public configuration: AkumaKodoConfigurationInterface;
    private readonly instance: BotWithCache;

    private _module_name: string;

    /**
     * @param bot - The AkumaKodo client instance
     * @param container - The AkumaKodo container instance
     * @param config - The AkumaKodo configuration instance
     * @param name - The name of the module
     */
    public constructor(
        bot: BotWithCache,
        container: AkumaKodoContainerInterface,
        config: AkumaKodoConfigurationInterface,
        name?: string,
    ) {
        this.container = container;
        this.configuration = config;
        this.instance = bot;
        this._module_name = name ?? "Custom Module";
        this.onLoad();
    }

    /**
     * The name of the custom module
     * @param eventName
     */
    protected onLoad(): void {
        this.container.logger.debug(
            "info",
            "AkumaKodo Module",
            `${this._module_name} loaded!`,
        );
    }
}
