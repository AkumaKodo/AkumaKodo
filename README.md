# AkumaKodo

A blazing fast discord bot framework built on top of [discordeno](https://github.com/discordeno/discordeno) and [typescript](https://www.typescriptlang.org/)!

## Installation

[Click me](https://akumakodo.github.io/AkumaKodo/index.html#installation)

## Read the [documentation](https://akumakodo.github.io/AkumaKodo/) here!

### Change Log

The current can be found [here](https://akumakodo.github.io/AkumaKodo/misc/changelog.html)

Join my discord [@link](https://discord.com/invite/N79DZsm3m2) for support and feedback!

## Example bot

```ts
import { AkumaKodoBotCore } from "https://deno.land/x/akumakodo@0.1.6/mod.ts";
import { config as dotEnvConfig } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";

const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

// Bot configuration
const Bot = new AkumaKodoBotCore(
    {
        botId: BigInt("your-bot-id"),
        events: {},
        intents: ["Guilds", "GuildMessages", "GuildMembers"],
        token: TOKEN,
    },
    {
        optional: {
            // False by default but we recommend using the built
            // in logging system until your app hits production.
            bot_debug_mode: true,
            // Enables the built in events in the framework
            bot_internal_events: {
                // Allows the bot to reply to slash commands
                interactionCreate: true,
            },
        },
        required: {
            // needed if you wish to use test slash commands.
            bot_development_server_id: BigInt("your-guild-id"),
        },
    },
);

// Our own custom event handler
Bot.client.events.ready = (_, payload) => {
    Bot.container.logger.log("info", "ready", "Online and ready to work!");
};

// Creates a command
Bot.container.utils.createCommand(Bot, {
    trigger: "ping",
    description: "ping pong",
    scope: "Development",
    run: async (interaction) => {
        await Bot.container.utils.createCommandReply(
            Bot,
            interaction,
            {
                embeds: [
                    Bot.container.utils.embed().setColor("random")
                        .setDescription("pong!"),
                ],
            },
            false,
        );
    },
});

// Creates ws connection and starts listening
await Bot.createBot();
```
