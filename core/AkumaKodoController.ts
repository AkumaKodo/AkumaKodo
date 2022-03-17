import { AkumaKodoBotCore } from "./AkumaKodo.ts";
import { EventEmitter } from "../deps.ts";
import { AkumaKodoCollection } from "./lib/utils/Collection.ts";

export class AkumaKodoController<T extends AkumaKodoBotCore> extends EventEmitter {
  protected client: T;
  /* The directory of the modules */
  protected dir: string;
  public pool: AkumaKodoCollection<string, any>;
  public constructor(client: T, dir: string) {
    super();
    this.client = client;
    this.dir = dir;
    this.module = new AkumaKodoCollection();
  }

  public async load(thing: any) {
    let mod = await import("file://" + thing);
    mod = new mod.default();

    this.register(mod, thing);

    return mod;
  }
  public remove(id: any) {
    const mod = this.pool.get(id.toString());
    if (!mod) return;
    this.deregister(mod);
    return mod;
  }
  public async reload(id: any) {
    const mod = this.pool.get(id);
    if (!mod) return;
    this.deregister(mod);

    const filepath = mod.filepath;
    return await this.load(filepath);
  }
  public deregister(mod: any) {
    this.module.delete(mod.id);
  }
  public async reloadAll() {
    for (const m of Array.from(this.pool.values()) as any[]) {
      if (m.filepath) await this.reload(m.id);
    }

    return this.module;
  }
  public async loadALL(dirPath?: any) {
    dirPath = await Deno.realPath(dirPath || this.dir);
    const entries = Deno.readDir(dirPath);
    for await (const entry of entries) {
      if (entry.isFile) {
        await this.load(`${dirPath}/${entry.name}`);
        continue;
      }

      await this.loadALL(`${dirPath}/${entry.name}`);
    }
  }

  public register(mod: any, filepath: any) {
    mod.filepath = filepath;
    mod.handler = this;
    mod.client = this.client;
    this.module.set(mod.id, mod);
  }
}
