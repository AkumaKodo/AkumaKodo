import {AkumaKodoModule, AkumaKodoModuleOptions} from "../../AkumaKodoModule.ts";
import {EventHandlers} from "https://deno.land/x/discordeno@13.0.0-rc18/src/bot.ts";
import {AkumaKodoListenerController} from "./controller.ts";
import {AkumaKodoBotCore} from "../../AkumaKodo.ts";

export interface AkumaListenerOptions<T = any> extends AkumaKodoModuleOptions {
    event: T;
    emitter: string;
}

export type AkuamKodoListenerOptionsDiscordenoEvents = AkumaListenerOptions<keyof EventHandlers>;

export abstract class AkumaKodoListener  extends AkumaKodoModule {
    declare handler: AkumaKodoListenerController<AkumaKodoBotCore>;
    event!: string;
    emitter!: string;
}