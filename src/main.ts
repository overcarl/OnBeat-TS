import { dirname, importx } from "@discordx/importer";
import type { CommandInteraction, Interaction, Message } from "discord.js";
import { ActivityType, EmbedBuilder, IntentsBitField, Partials, type TextChannel} from "discord.js";
import * as dotenv from 'dotenv'
dotenv.config();
import { Client } from "discordx";
import { Koa } from "@discordx/koa";

import sql from './Database';


export const bot = new Client({
  partials: [Partials.Channel, Partials.Message],
  allowedMentions: {
    parse: [], repliedUser: true
  },
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildPresences,
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
  function status() {
    const array = [{
      name: `${bot.guilds?.cache.size} servers!`,
      type: ActivityType.Listening
    }]
    const random = array[Math.floor(Math.random() * array.length)] as any;
    bot.user?.setActivity(random)
  }
  status()
  setInterval(status, 16000)
  await bot.initApplicationCommands();
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
    const logs = bot.channels.cache.get("1062366877541748826") as TextChannel;
      if(interaction.isCommand()) {
        logs?.send(`${interaction.user?.tag} used \`${interaction}\` at ${interaction.guild?.name}`)
      }
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

  await app.build();
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`visit localhost:${port}/guilds`);
  });
}

run();
