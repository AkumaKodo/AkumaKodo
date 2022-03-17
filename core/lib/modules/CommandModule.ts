import {AkumaCreateBotOptions} from "../../interfaces/Client.ts";
import {AkumaKodoModule} from "./mod.ts";


export class AkumaKodoCommandModule extends AkumaKodoModule {
    public constructor(config: AkumaCreateBotOptions) {
        super(config);
    }

    public async createCommand() {
        this
    }
}