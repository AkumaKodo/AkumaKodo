import { AkumaKodoModuleOptions } from "../../AkumaKodoModule.ts";

export interface AkumaKodoInhibitorOptions extends AkumaKodoModuleOptions {
  priority?: number;
}

export abstract class AkumaKodoInhibitor {}
