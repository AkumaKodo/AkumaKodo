import {AkumaKodoBotCore} from "../../AkumaKodo.ts";
import {AkumaKodoController} from "../../AkumaKodoController.ts";
import {AkumaKodoCollection} from "../utils/Collection.ts";
import {AkumaKodoListener} from "./mod.ts";

export class AkumaKodoListenerController <T extends AkumaKodoBotCore> extends AkumaKodoController {
    declare modules: AkumaKodoCollection<string, AkumaKodoListener>;
    emitters: AkumaKodoCollection<string, any>;
    dir: string;

    constructor(client: T, { dir }: { dir: string }) {
        super(client, {
            dir,
        });
        this.dir = dir;
        this.modules = new AkumaKodoCollection();
        this.emitters = new AkumaKodoCollection();
        this.emitters.set("client", this.client);
    }


}