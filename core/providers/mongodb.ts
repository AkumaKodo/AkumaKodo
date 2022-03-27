// deno-lint-ignore-file
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { AkumaKodoLogger } from "../../internal/logger.ts";
import { ProviderOptions } from "../interfaces/Provider.ts";

interface schemaInterface {
    guildId: bigint;
    settings: any;
}

export class AkumaKodoMongodbProvider {
    public logger: AkumaKodoLogger;
    public pool: AkumaKodoCollection<
        bigint,
        schemaInterface | undefined
    >;
    public database_name: string;
    public options: ProviderOptions;
    // Typings for our mongo client instance
    protected connectedStatus: boolean;
    /**
     * Constructor for the mongodb provider.
     * @param options The options for the provider.
     * @param config The config for the provider.
     * @param name The name of the database mongodb will use.
     */
    public constructor(
        options: ProviderOptions,
        name?: string | undefined,
    ) {
        this.options = options;
        this.logger = new AkumaKodoLogger();
        if (!name) name = "AkumaKodo";
        this.database_name = name;
        // Mongo resources
        this.pool = new AkumaKodoCollection();
        this.connectedStatus = false;
        // this.logger.debug(
        //     "info",
        //     "Mongodb Provider",
        //     "Initialization complete.",
        // );
        throw new Error("Not implemented yet.");
    }
}
