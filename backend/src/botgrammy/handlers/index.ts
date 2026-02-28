import { Bot } from "grammy";

export function registerHandlers(bot: Bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply("Бот на webhook работает 🚀");
  });
}