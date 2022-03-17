import { AkumaKodoBotCore } from "../../AkumaKodo.ts";
import { AkumaKodoController } from "../../AkumaKodoController.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import { AkumaKodoListener } from "./mod.ts";

export class AkumaKodoListenerController<T extends AkumaKodoBotCore> extends AkumaKodoController<T> {
  declare pool: AkumaKodoCollection<string, AkumaKodoListener>;
  emitters: AkumaKodoCollection<string, any>;
  dir: string;

  constructor(client: T, dir: string) {
    super(client, dir);
    this.dir = dir;
    this.pool = new AkumaKodoCollection();
    this.emitters = new AkumaKodoCollection();
    this.emitters.set("client", this.client);
  }

  register(listener: AkumaKodoListener, filepath: string) {
    super.register(listener, filepath);
    listener.execute = listener.execute.bind(listener);
    this.addToEmitter(listener.id);
    return listener;
  }

  addToEmitter(id: string) {
    const listener = this.pool.get(id.toString());
    if (!listener) return;

    const emitter = this.emitters.get(listener.emitter);
    emitter.on(listener.event, listener.execute);
    return listener;
  }
  setEmitters(emitters: any) {
    for (const [key, value] of Object.entries(emitters)) {
      this.emitters.set(key, value);
    }

    return this;
  }
}
