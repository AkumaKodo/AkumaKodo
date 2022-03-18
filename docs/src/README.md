# Introduction

AkumaKodo (Pronounced: Ah-Ku-Ma Code Oh) is a discord deno bot framework written
in `TypeScript and deno`. It is designed to be a `modular and extensible` framework that
extends the functionality of the deno runtime. It is designed to be easy to use while
maintaining a high level of `performance`.

![AkumaKodo logo](images/misc/AkumaKodoLogo.png)

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/AkumaKodo/AkumaKodo?style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/AkumaKodo/AkumaKodo?style=for-the-badge)
![GitHub Repo stars](https://img.shields.io/github/stars/AkumaKodo/AkumaKodo?style=for-the-badge)
![Discord](https://img.shields.io/discord/837830514130812970?style=for-the-badge)

_The framework is build on discordeno version [13.0.0-rc18](https://deno.land/x/discordeno@13.0.0-rc18)_

### Inspiration

We took inspiration from these frameworks to help develop AkumaKodo into the tool it is today, thanks to all these great developers!

- [Natico](https://github.com/naticoo)
- [discord-akairo](https://discord-akairo.github.io/#/)
- [Amethyst](https://github.com/AmethystFramework)
- [discord.js-Commando](https://github.com/discordjs/Commando)

## Why use AkumaKodo

- Database providers for beginners getting started.
- Built in caching by default for quick data retrieval.
- Built in logging system with multiple log levels and terminal colors.
- Build in inhibitor system for permission handling.
- Built in task for custom scheduled events and actions.
- Function programming or OOP style.

## Why not use AkumaKodo

- You don't know javascript basics.
- Don't want to use the deno runtime.
- You like functional programming only.

## Installation

_Coming soon..._

## Example bot

```typescript
import { AkumaKodoBotCore } from "url-soon";
import { config as dotEnvConfig } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";
import {
  delay,
  InteractionResponseTypes,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";

const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

// Bot configuration
const Bot = new AkumaKodoBotCore({
  botId: BigInt("954180517908082739"),
  events: {},
  intents: ["Guilds", "GuildMessages", "GuildMembers"],
  token: TOKEN,
}, {
  optional: {
    bot_development_server_id: BigInt("954186846504648706"),
    bot_debug_mode: true,
    providers: {
      type: "disabled",
    },
  },
});

await Bot.createBot(); // Creates ws connection and starts listening

Bot.client.events.ready = (_, payload) => {
  Bot.container.logger.create("info", "ready", "Online and ready to work!");
};

Bot.container.utils.createCommand(Bot, {
  trigger: "ping",
  description: "ping me!",
  scope: "Development",
  run: async (interaction) => {
    await Bot.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: `Pong! ${interaction.user.username}`,
      },
    });
  },
});

Bot.initializeInternalEvents()
```

Continue reading!
