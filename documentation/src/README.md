# Introduction 

AkumaKodo (Pronounced: Ah-Ku-Ma Code Oh) is a discord deno bot framework written
in TypeScript and deno. It is designed to be a modular and extensible framework that
extends the functionality of the deno runtime. It is designed to be easy to use while
maintaining a high level of performance and function programming workflow.

*The framework is build on discordeno version [13.0.0-rc18](https://deno.land/x/discordeno@13.0.0-rc18)*

## Example bot

```typescript
import { AkumaKodoBot, createAkumaKodoBot } from "./deps.ts";

await createAkumaKodoBot(AkumaKodoBot, {
    botId: 1n,
    token: "token",
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
    events: {},
});

AkumaKodoBot.createMessageCommand({
    name: 'ping',
    description: 'Ping!',
    execute: (ctx) => {
        ctx.reply({
            content: 'Pong!',
        });
    }
})

AkumaKodoBot.events.ready = (_, payload) => {
    AkumaKodoBot.logger().info(`[READY] Bot is online and ready in ${AkumaKodoBot.guilds.size} guilds!`);
}
```