import { DiscordenoMessage, EventEmitter } from "../../../deps.ts";
import { AkumaKodoCollection } from "./Collection.ts";
import { AkumaKodoBotCore } from "../../AkumaKodo.ts";

interface CollectorOptions {
  time?: number;
  max?: number;
  errors?: Array<"timeout" | "limit">;
}

type MessageCollection = AkumaKodoCollection<bigint, DiscordenoMessage>;
type CollectorFilter = (message: DiscordenoMessage) => boolean;

export class MessageCollector extends EventEmitter {
  private readonly collection: MessageCollection;
  private collected: number;
  private ended: boolean;
  private options: CollectorOptions;

  constructor(
    client: AkumaKodoBotCore,
    message: DiscordenoMessage,
    filter: CollectorFilter = () => {
      return true;
    },
    options: CollectorOptions = { max: 1, time: 10 * 1000, errors: [] },
  ) {
    super();
    this.collection = new AkumaKodoCollection();
    this.collected = 0;
    this.ended = false;
    this.options = options;

    const messageListener = (msg: DiscordenoMessage) => {
      if (message.channelId === msg.channelId && filter(msg) === true) {
        this.collection.set(msg.id, msg);
        this.collected += 1;
        this.emit("collect", msg);
      }

      if ((options.max ?? 1) <= this.collected && !this.ended) {
        client.removeListener("messageCreate", messageListener);
        this.emit("end", "limit", this.collection);
        this.ended = true;
        return;
      }
    };

    setTimeout(() => {
      if (this.ended) return;
      client.removeListener("messageCreate", messageListener);
      this.emit("end", "timeout", this.collection);
      this.ended = true;
    }, options.time);

    client.on("messageCreate", messageListener);
  }

  public collect = new Promise<MessageCollection>((resolve, reject) => {
    this.once("end", (reason, collection) => {
      if (!this.options.errors?.includes(reason)) resolve(collection);
      else reject(reason);
    });
  });
}
