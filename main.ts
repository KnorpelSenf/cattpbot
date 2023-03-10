import {
  Bot,
  InlineKeyboard,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.5.2/mod.ts";
import { serve } from "https://deno.land/std@0.116.0/http/server.ts";

const token = Deno.env.get("BOT_TOKEN");
if (token === undefined) throw new Error("Missing BOT_TOKEN");

const bot = new Bot(token);

bot
  .drop((ctx) => ctx.msg?.via_bot?.id === ctx.me.id)
  .on("message", async (ctx) => {
    await ctx.reply("I can search for HTTP cat images inline.", {
      reply_markup: new InlineKeyboard()
        .switchInlineCurrent("Search here").row()
        .switchInline("Share cat"),
    });
  });

bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  let url = `https://http.cat/${query}.jpg`;
  const res = await fetch(url, { method: "HEAD" });
  if (res.status === 200) {
    await ctx.answerInlineQuery([{
      type: "photo",
      id: query,
      photo_url: url,
      thumb_url: url,
    }]);
  } else {
    url = "https://http.cat/404.jpg";
    await ctx.answerInlineQuery([{
      type: "photo",
      id: "404",
      photo_url: url,
      thumb_url: url,
    }]);
  }
});

serve(webhookCallback(bot, "std/http"));
