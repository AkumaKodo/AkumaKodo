import { AkumaKodoModule, AkumaKodoModuleOptions } from "../../AkumaKodoModule.ts";
import { AkumaKodoInhibitorController } from "./controller.ts";
import { AkumaKodoBotCore } from "../../AkumaKodo.ts";

export interface AkumaKodoInhibitorOptions extends AkumaKodoModuleOptions {
  priority?: number;
}

export abstract class AkumaKodoInhibitor extends AkumaKodoModule {
  declare handler: AkumaKodoInhibitorController<AkumaKodoBotCore>;
  priority!: number;
}
