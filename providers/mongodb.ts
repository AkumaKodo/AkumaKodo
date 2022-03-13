import { AkumaKodoProvider, BaseProviderModel, ProviderOptions } from "./mod.ts";
import { Bson, MongoClient } from "../deps.ts";
import { AkumaKodoCollection } from "../core/lib/utils/Collection.ts";

/**
 * Base mongodb schema for our provider.
 */
interface mongodbSchema extends BaseProviderModel {
  _id: Bson.ObjectId;
  // deno-lint-ignore no-explicit-any
  data?: Record<any, any> | null;
}

export class AkumaKodoMongodbProvider extends AkumaKodoProvider {
  protected cache!: AkumaKodoCollection<string, mongodbSchema>;
  protected client!: MongoClient;
  private database_name: string;

  /**
   * Constructor for the mongodb provider.
   * @param options The options for the provider.
   * @param model The model for the provider.
   * @param name The name of the database mongodb will use.
   */
  public constructor(options: ProviderOptions, model: mongodbSchema, name?: string) {
    super(options, model);
    this.database_name = name || "akumakodo-mongodb-settings";
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
}
