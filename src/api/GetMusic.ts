import { Get, Router } from "@discordx/koa";
import type { Context } from "koa";

import { bot } from '../main'
import { MusicCommands } from '../commands/music/play'
import { Guild } from 'discord.js'

@Router()
export class API {
  @Get("/api/queue/:id")
  index(ctx: Context) {
    const guildId = ctx.params.id
    const guild = bot.guilds.cache.get(guildId)
    if(!guild) return ctx.body = {
      "error": "Guild not found",
      "code": 404
    };
    const player = new MusicCommands().playerBot;
    const queue = player.queue(guild);
    console.log(queue.currentTrack)
    ctx.body = {
      "guildName": guild?.name,
      "isPlaying": queue?.isPlaying
    };
  }
}