import {AkumaKodoModule} from "../../AkumaKodoModule.ts";
import {EventHandlers} from "https://deno.land/x/discordeno@13.0.0-rc18/src/bot.ts";
import {AkumaKodoListenerController} from "./controller.ts";
import {AkumaKodoBotCore} from "../../AkumaKodo.ts";

export interface AkumaListenerOptions<T = any> extends AkumaKodoModule {
    event: T;
    emitter: string;
}

export type AkuamKodoListenerOptionsDiscordenoEvents = AkumaListenerOptions<keyof EventHandlers>;

export abstract class AkumaKodoListener  extends NaticoModule {
    declare handler: AkumaKodoListenerController<AkumaKodoBotCore>;
    event!: string;
    emitter!: string;
}