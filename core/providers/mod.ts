import { AkumaKodoLogger } from "../../internal/logger.ts";
import { AkumaKodoConfigurationInterface } from "../interfaces/Client.ts";
/**
 * Base provider class for all providers.
 */
export abstract class AkumaKodoProvider {
    protected logger: AkumaKodoLogger;
    protected configuration: AkumaKodoConfigurationInterface;
    protected constructor(
        options: ProviderOptions,
        config: AkumaKodoConfigurationInterface,
    ) {
        this.configuration = config;

        this.logger = new AkumaKodoLogger();
        if (
            this.configuration.optional.providers &&
            options.provider === "mongodb"
        ) {
            if (!options.mongodb_connection_url) {
                throw new Error(
                    "MongoDB connection URL is required with this provider.",
                );
            }
            this.logger.debug("info", "Provider", "MongoDB provider loaded!");
        } else if (
            this.configuration.optional.providers &&
            options.provider === "postgres"
        ) {
            this.logger.debug(
                "info",
                "Provider",
                "PostgreSQL provider loaded!",
            );
        } else if (
            this.configuration.optional.providers &&
            options.provider === "mysql"
        ) {
            this.logger.debug("info", "Provider", "MySQL provider loaded!");
        }
    }
}

export interface ProviderOptions {
    provider: "mongodb" | "postgres" | "mysql";
    mongodb_connection_url?: string;
}

export interface BaseProviderModel {
    type?: "mongodb" | "postgres" | "mysql";
}

export { AkumaKodoMongodbProvider } from "./mongodb.ts";
