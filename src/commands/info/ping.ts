import { Discord, Slash, SlashGroup } from 'discordx'
import {
  Client,
  CommandInteraction,
  EmbedBuilder
} from 'discord.js'

@Discord()
@SlashGroup('info')
export class BotInfo {
  @Slash({
    name: "ping",
    description: "pong!"
  })
  async run(i: CommandInteraction, client: Client) {
    i?.reply(`🏓 • Pong! ${client.ws.ping??0}ms`)
  }
}