/** Options for the bot client */
import {Bot, CreateBotOptions, startBot} from "https://deno.land/x/discordeno@13.0.0-rc20/bot.ts";

interface create_bot_options extends CreateBotOptions {
    bot_owners_ids?: bigint[];
    bot_supporters_ids?: bigint[];
    bot_staff_ids?: bigint[];
}

/**
 * Creates a bot client
 * @param bot
 * @link https://deno.land/x/discordeno@13.0.0-rc20/bot.ts#L270
 * @param options
 * @link https://deno.land/x/discordeno@13.0.0-rc20/bot.ts#L70
 * @returns The Bot
 */
export async function createAkumaKomoBot(bot: Bot, options?: create_bot_options): Promise<Bot> {
    await startBot(bot);
    return bot;
}
