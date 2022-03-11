import {AkumaKomoBot, AkumaKomoBotWithCache, createAkumaKomoBot} from "../packages/core/lib/mod.ts";

createAkumaKomoBot(AkumaKomoBotWithCache, {
    botId: 0n,
    token: "",
    intents: [],
    events: {}
}).then(() => {
    console.log('Cached Bot created!')
})

createAkumaKomoBot(AkumaKomoBot, {
    botId: 1n,
    token: "",
    intents: [],
    events: {}
}).then(() => {
    console.log('Bot created!')
})