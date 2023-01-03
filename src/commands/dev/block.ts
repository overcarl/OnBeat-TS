import { Discord, Guild, Slash, SlashGroup, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  User
} from 'discord.js'
import { uuid } from 'uuidv4';

import sql from '../../Database'

@Discord()
@Guild(process.env.TEST_GUILD as string)
class Ban {
  @Slash({
    name: "block",
    description: "Ban user"
  })
  async block(
    @SlashOption({
      name: "user",
      description: "User id to ban",
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: User,
    i: CommandInteraction
  ) {
    if (!["407859300527243275"].includes(i.user?.id)) return;

    const useri = await sql`
    SELECT * FROM users WHERE id = ${user?.id}
    `
    if (!useri[0]) return i?.reply("User does not exists");

    const ban = await sql`
    UPDATE users SET banned=${true} WHERE id = ${user?.id}
    `
    i?.reply(`${user?.username} banned!`)
  }
}