import { AkumaKodoProvider, ProviderOptions } from "./mod.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { AkumaKodoConfigurationInterface } from "../interfaces/Client.ts";
import { Model, MongoFactory, Prop, Schema, SchemaDecorator } from "../../deps.ts";

interface schemaInterface {
  guildId: bigint;
  settings: any;
}

@SchemaDecorator()
class InternalMongoSchema extends Schema implements schemaInterface {
  @Prop({
    required: true,
  })
  guildId!: bigint;

  @Prop({
    required: false,
    default: {},
  })
  settings!: unknown;
}

export class AkumaKodoMongodbProvider extends AkumaKodoProvider {
  protected metadata: AkumaKodoCollection<bigint, schemaInterface | undefined>;
  protected database_name: string;
  protected options: ProviderOptions;
  // Typings for our mongo client instance
  protected instance: Promise<Model<InternalMongoSchema>>;
  private readonly connectedStatus: boolean;
  /**
   * Constructor for the mongodb provider.
   * @param options The options for the provider.
   * @param config The config for the provider.
   * @param name The name of the database mongodb will use.
   */
  public constructor(options: ProviderOptions, config: AkumaKodoConfigurationInterface, name?: string | undefined) {
    super(options, config);
    this.options = options;
    if (!name) name = "AkumaKodo";
    this.database_name = name;
    // Mongo resources
    this.instance = MongoFactory.getModel(InternalMongoSchema); // gives use access to mongo functions
    this.metadata = new AkumaKodoCollection();
    this.connectedStatus = false;
  }

  /**
   * Connect to the database
   */
  public async connect() {
    while (!this.connectedStatus) {
      try {
        let url = this.options.mongodb_connection_url;
        if (!url) url = "mongodb://localhost:27017"; // default to localhost if no host is found.
        await MongoFactory.forRoot(url);
        this.logger.create("info", "Mongo Provider", `Connection success on > ${url}`);
      } catch (e) {
        this.logger.create("error", "Mongodb Provider", `Failed to connect to the database.\n ${e}`);
      }
    }
  }

  /**
   * Starts the provider.
   * @returns Promise<void>
   */
  public async initialize() {
    if (this.connectedStatus) {
      await (await this.instance).initModel();
      // Fetch all the documents from the database and cache them.
      const data = await (await this.instance).findMany();
      for (const item of data) {
        this.metadata.set(item.guildId, <schemaInterface> item.settings);
      }
      this.logger.create(
        "info",
        "Mongo Provider initialize",
        `Successfully loaded ${data.length} documents from the database.`,
      );
    } else {
      this.logger.create(
        "error",
        "Mongodb Provider initialize",
        `Failed to initialize the database. Please check your connection.`,
      );
    }
  }

  /**
   * Get a value from the cache.
   * @param id The guild id to get the value from.
   * @param key The key to get the value from.
   * @param defaultValue The default value to return if the key is not found.
   */
  public get(id: bigint, key: string, defaultValue: any) {
    const data = this.metadata.get(id);

    if (data) {
      this.logger.create(
        "info",
        "Mongo Provider get",
        `Fetched value from cache. Guild: ${id} Key: ${key} Value: ${data.settings[key]}`,
      );
      return data.settings[key];
    }

    this.logger.create("warn", "Mongo Provider get", `Failed to get the value for ${id}. Returning default value.`);

    return defaultValue;
  }

  /**
   * Set a value in the cache and database.
   * @param id The guild id to set the value in.
   * @param key The key to set the value in.
   * @param value The value to set.
   */
  public async set(id: bigint, key: string, value: any) {
    const data = this.metadata.get(id);
    // if we have old data, update it
    if (data) {
      const newData = data.settings[key] = value;
      this.metadata.set(id, newData);
    }

    // saves the data in the database
    await (await this.instance).updateOne({ guildId: id }, { $set: { settings: { [key]: value } } }, { upsert: true });

    this.logger.create("info", "Mongo Provider set", `Successfully set ${key} to ${value} for guild ${id}`);
  }

  /**
   * Delete a value from the cache and database.
   * @param id
   * @param key
   */
  public async delete(id: bigint, key: string) {
    const data = this.metadata.get(id);
    // if we have old data, update it
    if (data) {
      delete data.settings[key];
      this.metadata.set(id, { ...data, settings: { ...data.settings } });
    }

    // saves the data in the database
    await (await this.instance).deleteOne({ guildId: id });

    this.logger.create("info", "Mongo Provider delete", `Deleted ${key} from guild ${id}`);
  }

  /**
   * Delete all values from the cache and database for a guild.
   * @param id The guild id to delete all values from.
   */
  public async clear(id: bigint) {
    this.metadata.delete(id);
    await (await this.instance).deleteOne({ guildId: id });
    this.logger.create("info", "Mongo Provider clear", `Cleared all data for guild ${id}`);
  }
}
