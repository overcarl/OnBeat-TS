import { Get, Middleware, Post, Router } from "@discordx/koa";
import type { Context } from "koa";

import { bot } from '../main'
import { MusicCommands } from '../commands/music/play'
import { Guild } from 'discord.js'

import Topgg from '@top-gg/sdk'
const webhook = new Topgg.Webhook(process.env.topggauth as string)

@Router()
export class API {
  @Get("/")
  index(ctx: Context): void {
    console.log()
    ctx.body = { "message": "Welcome to OnBeat Server!" };
    ctx.type = "application/json"
  }
  @Post("/topgg/webhook")
  @Middleware(webhook.listener(vote => {
    const user = bot.users.cache.get(vote.user)
    if(!user) return;
    // console.log(user?.username)
  }))
  webhookPost(ctx: Context) {
    ctx.body = {
      "Topgg": "Posted to OnBeat!"
    }
  }
}