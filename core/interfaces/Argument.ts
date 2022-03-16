// All the items the parsers return
import { DiscordenoChannel, DiscordenoMember, DiscordenoMessage, DiscordenoRole } from "../../deps.ts";
import {AkumaKodoBotCore} from "../AkumaKodo.ts";
import {AkumaKodoCollection} from "../lib/utils/Collection.ts";
import {AkumaKodoCommand} from "./Command.ts";

export type returnItems = DiscordenoRole | DiscordenoChannel | DiscordenoMember | number | string | boolean | undefined;

export type Argument = (
  message: DiscordenoMessage,
  args: string,
) => [returnItems, string | undefined] | Promise<[returnItems, string | undefined]>;

export type ReturnType = [returnItems, string | undefined];

export type Arguments = { [name: string]: returnItems };

export const applyOptions = <T extends any>(options: T) =>
  (Pool: any): any => {
    //@ts-ignore -
    return class extends Pool {
      constructor() {
        super();
        Object.assign(this, options);
      }
    };
  };


export class AkumaArgumentGenorator {
    client: AkumaKodoBotCore
    arguments: AkumaKodoCollection<string, Argument>

    constructor(client: AkumaKodoBotCore) {
        this.client = client;
        this.arguments = new AkumaKodoCollection();
        this.preload()
    }

    /** Preload all the arguments to our cache */
   private preload() {

    }

    public async handleArguments(command: AkumaKodoCommand, message: DiscordenoMessage, args?: string) {

    }
}