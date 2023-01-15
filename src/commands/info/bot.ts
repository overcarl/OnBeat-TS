import { Discord, Slash, SlashGroup } from 'discordx'
import {
  Client,
  CommandInteraction,
  EmbedBuilder
} from 'discord.js'
import { Pagination } from "@discordx/pagination";

@Discord()
@SlashGroup({
  name: "info",
  description: "Info commands"
})
@SlashGroup('info')
export class BotInfo {
  private get pages() {
    return [{
      "embeds": [
        {
          "color": 0xFEAAF1,
          "author": {
            "name": "About OnBeat",
            "icon_url": "https://i.ibb.co/VLBYvP9/Novo-projeto-211-7-FF4827.png"
          },
          "description": "OnBeat is a music radio Discord bot. Listen radio with your friends together!",
          "fields": [
            {
              "name": "👑 • Created by",
              "value": "• Hamburger\n• Igor",
              "inline": true
            },
            {
              "name": "💁 • Contributors",
              "value": "• GitHub: Drake, Oly Koala, Riley\n• Partners: Flintch LTD",
              "inline": true
            }
          ]
        }
      ]
    }, {
      "embeds": [
        {
          "author": {
            "icon_url": "https://i.ibb.co/VLBYvP9/Novo-projeto-211-7-FF4827.png",
            "name": "About OnBeat"
          },
          "title": "👨‍💻 • Some programming",
          "description": "",
          "fields": [
            {
              "name": "⌨️ • Programming Language",
              "value": "OnBeat is written in the TypeScript programming language, runs on the Node.js runtime.",
              "inline": true
            },
            {
              "name": "📦 • Packages",
              "value": "We use the packages: [Discord.js](https://discord.js.org), [DiscordX](https://discordx.js.org) and [Supabase](https://supabase.com/).",
              "inline": true
            }
          ],
          "color": 39129
        }
      ]
    }, {
      "embeds": [
        {
          "author": {
            "icon_url": "https://i.ibb.co/VLBYvP9/Novo-projeto-211-7-FF4827.png",
            "name": "About OnBeat"
          },
          "title": "💁 • Support",
          "description": `You can contact our developers on [Support Server](https://discord.gg/QTGp56HhQC) or on [Twitter](https://twitter.com/OnBeat_Me).`
        }
      ]
    }]
  }
  @Slash({
    name: "bot",
    description: "Bot info"
  })
  async info(i: CommandInteraction, client: Client) {
    const pagination = new Pagination(i, this.pages);
    await pagination.send();
  }
}