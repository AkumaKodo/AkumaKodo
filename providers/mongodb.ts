import { AkumaKodoProvider, BaseProviderModel, ProviderOptions } from "./mod.ts";
import { Bson, Collection, Database, MongoClient } from "../deps.ts";
import { AkumaKodoCollection } from "../core/lib/utils/Collection.ts";
import { delay } from "../internal/utils.ts";
import { AkumaKodoLogger } from "../internal/logger.ts";
import {Milliseconds} from "../core/lib/utils/helpers.ts";
import {AkumaCreateBotOptions} from "../core/interfaces/Client.ts";

/**
 * Base mongodb schema for our provider.
 */
interface mongodbSchema extends BaseProviderModel {
  _id: Bson.ObjectId;
  guildId: bigint;
  // deno-lint-ignore no-explicit-any
  data: any;
}

export class AkumaKodoMongodbProvider extends AkumaKodoProvider {
  protected cache: AkumaKodoCollection<bigint, mongodbSchema>;
  protected client: MongoClient;
  private __db: Database;
  protected db: Collection<mongodbSchema>;
  private database_name: string;
  private options: ProviderOptions;
  private connectedStatus: boolean;
  /**
   * Constructor for the mongodb provider.
   * @param options The options for the provider.
   * @param model The model for the provider.
   * @param config The config for the provider.
   * @param name The name of the database mongodb will use.
   */
  public constructor(options: ProviderOptions, model: mongodbSchema, config: AkumaCreateBotOptions,  name?: string) {
    super(options, model, config);
    this.options = options;
    if (!name) name = "AkumaKodo";
    this.database_name = name;
    // Required resources
    this.cache = new AkumaKodoCollection();
    this.client = new MongoClient();
    // We need to configure the database before the collection.
    this.__db = this.client.database(name);
    // Giving easier access to the collection.
    this.db = this.__db.collection("settings");
    this.connectedStatus = false;
  }

  /**
   * Connect to the database
   * @protected
   */
  protected async connect() {
    while (!this.connectedStatus) {
      try {
        await delay(Milliseconds.Second * 2);
        const cs = this.options.mongodb_connection_url ?? "mongodb://localhost:27017";
        await this.client.connect(cs);
        this.connectedStatus = true;
        this.logger.create(`info`, "Mongodb Provider", `Connected to mongodb at ${cs}`);
      } catch (e) {
        this.logger.create("error", "Mongodb Provider", `Failed to connect to the database.`);
    }
  }
  }

  /**
   * Disconnect from the database
   * @protected
   */
  protected async disconnect() {
    await this.client.close();
  }

  /**
   * Get the database client from mongodb
   * @protected
   */
  protected get getMongoClient() {
    return this.client;
  }

  /**
   * Starts the provider.
   * @returns Promise<void>
   */
  public async initialize() {
    if (this.connectedStatus) {
      // give the bot process time to start up
      await delay(Milliseconds.Second * 2);
      // find all the settings in the collection and save them to the cache
      const fillCollections = await this.db.find({ username: { $ne: null } }).toArray();
      // Save all settings to the cache based on their guild id
      for (const i in fillCollections) {
        const settings = fillCollections[i];
        this.cache.set(settings.guildId, settings);
      }
      this.logger.create("info", "Mongodb Provider", `Loaded ${this.cache.size} settings to cache.`);
    } else {
      this.logger.create("error", "Mongodb Provider", `Failed to initialize the database. Please check your connection.`);
    }
  }

  /**
   * Get a value from the cache.
   * @param guildId The guild id to get the value from.
   * @param key The key to get the value from.
   * @param defaultValue The default value to return if the key is not found.
   */
  public get(guildId: bigint, key: string, defaultValue: any) {
    if (this.cache.has(guildId)) {
      const settings = this.cache.get(guildId);
      if (settings) {
        const data = settings.data[key];
        this.logger.create("info", "Mongodb Provider", `Getting value for ${key} from cache.\n${JSON.stringify(data)}`);
        return data == null ? defaultValue : data;
      }
    } else {
      return defaultValue;
    }
  }
}
