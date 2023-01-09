import { dirname, importx } from "@discordx/importer";
import type { CommandInteraction, Interaction, Message } from "discord.js";
import { ActivityType, EmbedBuilder, IntentsBitField, Partials } from "discord.js";
import * as dotenv from 'dotenv'
dotenv.config();
import { Client } from "discordx";
import { Koa } from "@discordx/koa";

import sql from './Database';


export const bot = new Client({
  partials: [Partials.Channel, Partials.Message],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
  silent: false,
  simpleCommand: { prefix: "." }
});

import { AutoPoster } from 'topgg-autoposter';
import  topgg from '@top-gg/sdk'
const token = process.env.topgg as string
const post = AutoPoster(token, bot);
export const Api = new topgg.Api(token)

bot.on("ready", async () => {
  // await bot.clearApplicationCommands();

  // console.log(random)
  bot.user?.setActivity("OnBeat 1st Birthday!", { type: ActivityType.Listening })
  await bot.initApplicationCommands();
  // console.log(token)
})

post.on("posted", () => {
  console.log("WHOOOO posted to topgg")
})

bot.on("interactionCreate", async (interaction: Interaction) => {
  try {
    const user = await sql`
     SELECT * FROM users WHERE id = ${interaction?.user.id}
    `
    if (!user[0]) {
      const data = await sql`
       INSERT INTO users (id) VALUES (${interaction?.user.id})
      `
    }

    // if(user[0].banned) return;
    await bot.executeInteraction(interaction);
  } catch (e) {
    console.log(e)
  }
});

bot.on("messageCreate", async (message: Message) => {
  try {
    await bot.executeCommand(message);
  } catch (e) {
    console.log(e)
  }
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands,api}/**/*.{ts,js}`);


  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  await bot.login(process.env.BOT_TOKEN);
  const app = new Koa();


  // api: need to build the api server first
  await app.build();

  // api: let's start the server now
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`discord api server started on ${port}`);
    console.log(`visit localhost:${port}/guilds`);
  });
}

run();