import { Bot } from "grammy";
import { registerHandlers } from "./handlers";

export const bot = new Bot(process.env.TG_BOT_TOKEN2!);

registerHandlers(bot);