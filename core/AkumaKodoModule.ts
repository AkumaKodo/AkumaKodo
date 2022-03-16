/**Base class for modules */
import { AkumaKodoBotCore } from "./AkumaKodo.ts";

export abstract class AkumaKodoModule {
  public id: string;
  public filepath: string;
  public client: AkumaKodoBotCore;
  public pool!: {
    reload: (id: string) => void;
    remove: (id: string) => void;
  };

  public constructor(id: string, filepath: string, client: AkumaKodoBotCore) {
    this.id = id;
    this.filepath = filepath;
    this.client = client;
  }

  public reload() {
    return this.pool.reload(this.id);
  }

  public remove() {
    return this.pool.remove(this.id);
  }

  public toString() {
    return this.id;
  }
  abstract exec(...args: unknown[]): unknown | Promise<unknown>;
}

export interface AkumaKodoModuleOptions {
  id: string;
}
