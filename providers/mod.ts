import { AkumaKodoLogger } from "../internal/logger.ts";
import { AkumaKodoCollection } from "../core/lib/utils/Collection.ts";

/**
 * Base provider class for all providers.
 */
export abstract class AkumaKodoProvider {
  protected model: BaseProviderModel;
  protected constructor(options: ProviderOptions, model: BaseProviderModel) {
    if (options.provider === "mongodb") {
      this.model = model;
      AkumaKodoLogger("info", "Provider", "MongoDB provider loaded!");
    } else if (options.provider === "postgres") {
      this.model = model;
      AkumaKodoLogger("info", "Provider", "PostgreSQL provider loaded!");
    } else if (options.provider === "mysql") {
      this.model = model;
      AkumaKodoLogger("info", "Provider", "MySQL provider loaded!");
    } else {
      throw new Error("Invalid provider type! Please use one of the following: mongodb, postgres, mysql");
    }
  }
}

export interface ProviderOptions {
  provider: "mongodb" | "postgres" | "mysql";
  // deno-lint-ignore no-explicit-any
  model: any;
}

export interface BaseProviderModel {
  type?: "mongodb" | "postgres" | "mysql";
}
