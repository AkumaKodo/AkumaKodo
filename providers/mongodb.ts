import { AkumaKodoProvider, BaseProviderModel, ProviderOptions } from "./mod.ts";
import { Bson, Collection, Database, MongoClient } from "../deps.ts";
import { AkumaKodoCollection } from "../core/lib/utils/Collection.ts";
import { delay } from "../internal/utils.ts";
import { Milliseconds } from "../core/lib/utils/Helpers.ts";
import { AkumaKodoLogger } from "../internal/logger.ts";

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

  /**
   * Constructor for the mongodb provider.
   * @param options The options for the provider.
   * @param model The model for the provider.
   * @param name The name of the database mongodb will use.
   */
  public constructor(options: ProviderOptions, model: mongodbSchema, name?: string) {
    super(options, model);
    if (!name) name = "AkumaKodo";
    this.database_name = name;
    // Required resources
    this.cache = new AkumaKodoCollection();
    this.client = new MongoClient();
    // We need to configure the database before the collection.
    this.__db = this.client.database(name);
    // Giving easier access to the collection.
    this.db = this.__db.collection("settings");
  }

  /**
   * Connect to the database
   * @param url Mongodb connection string
   * @protected
   */
  protected async connect(url: string) {
    await this.client.connect(url);
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
    // give the bot process time to start up
    await delay(Milliseconds.Second * 2);
    // find all the settings in the collection and save them to the cache
    const fillCollections = await this.db.find({ username: { $ne: null } }).toArray();
    // Save all settings to the cache based on their guild id
    for (const i in fillCollections) {
      const settings = fillCollections[i];
      this.cache.set(settings.guildId, settings);
    }
    AkumaKodoLogger("info", "Mongodb Provider", `Loaded ${this.cache.size} settings to cache.`);
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
        return data == null ? defaultValue : data;
      }
    } else {
      return defaultValue;
    }
  }
}
