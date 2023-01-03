import { Get, Router } from "@discordx/koa";
import type { Context } from "koa";

import { bot } from '../main'
import { MusicCommands } from '../commands/music/play'
import { Guild } from 'discord.js'

@Router()
export class API {
  @Get("/")
  index(ctx: Context): void {
    console.log()
    ctx.body = { "message": "Welcome to OnBeat Server!" };
    ctx.type = "application/json"
  }
}