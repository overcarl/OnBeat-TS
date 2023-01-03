import { Discord, Guild, Slash, SlashGroup, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction
} from 'discord.js'
import { uuid } from 'uuidv4';

import sql from '../../Database'

@Discord()
@SlashGroup({
  name: "new",
  description: "[DEV]"
})
@SlashGroup("new")
@Guild(process.env?.TEST_GUILD as string)
class New {
  @Slash({
    name: "radio",
    description: "Add new radio"
  })
  async new(
    @SlashOption({
      description: "Set a name to radio",
      name: "name",
      required: true,
      type: ApplicationCommandOptionType.String,
    }) name: string,
    @SlashOption({
      description: "Set a url to radio",
      name: "url",
      required: true,
      type: ApplicationCommandOptionType.String,
    }) url: string,
    @SlashOption({
      description: "Description",
      name: "description",
      required: false,
      type: ApplicationCommandOptionType.String,
    }) description: string,
    @SlashOption({
      description: "Verify radio",
      name: "verified",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    }) verified: boolean,
    interaction: CommandInteraction
  ) {
    if (interaction.user?.id !== "407859300527243275") return;
    const data = await sql`
     INSERT INTO radios (id, name, url, verified, description) VALUES (${uuid()}, ${name}, ${url}, ${verified ?? false}, ${description??null})
    `
    console.log(data);
    
    // if(!data[0]) return interaction?.reply("Something went wrong");
    interaction?.reply(`\`\`\`js\n${data[0]}\`\`\``)
  }
}