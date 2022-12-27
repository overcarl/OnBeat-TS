import { Player, CustomTrack, Queue } from '@discordx/music'
import { Client, Discord, Guild, SelectMenuComponent, Slash, SlashGroup } from 'discordx'
import type {
  CommandInteraction,
  Guild as DGuild,
  GuildMember,
  StringSelectMenuInteraction,
  VoiceChannel
} from 'discord.js'

import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder
} from 'discord.js'

import sql from '../../Database'

@Discord()
@SlashGroup({
  name: "music",
  description: "Music commands"
})
@SlashGroup("music")
class MusicCommands {
  player;
  constructor() {
    this.player = new Player();
  }
  @Slash({
    name: "play",
    description: "Select a Radio to Play"
  })
  async play(interaction: CommandInteraction) {
    const radios = await sql`
      SELECT * FROM radios ORDER BY name ASC;
      `
    const selectRadios = radios.map((r, i) => {
      if(r.description) return {
        label: r.name,
        description: r.description,
        value: r.id
      }; else return {
        label: r.name,
        value: r.id
      }
    })
    console.log(selectRadios)
    const radio = new StringSelectMenuBuilder()
      .setCustomId("radios")
      .setPlaceholder("Select a radio")
      .setOptions(selectRadios);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(radio)

    interaction?.reply({
      content: "Select a radio",
      components: [row],
      ephemeral: true
    })
  }
  @SelectMenuComponent({ id: "radios" })
  async select(i: StringSelectMenuInteraction) {
    const player = this.player;
    const member = i?.member as GuildMember;
    const guild = i?.guild as DGuild;
    const me = i.guild?.members.me as GuildMember;
    const voice = member?.voice.channel as VoiceChannel;
    const voiceme = me?.voice.channel as VoiceChannel;
    
    await i?.deferReply({
      ephemeral: true
    })
    const radio = i.values?.[0];
    const radios = await sql`
      SELECT * FROM radios WHERE id = ${radio}
      `;
    const _radio = radios[0];
    if (!_radio) return i?.followUp({
      content: "Something went wrong..."
    });
    if (!voice) return i?.followUp({
      content: "[🔊] Join on a Voice Channel"
    });;
    const queue = player.queue(guild);
    if(queue.isPlaying) await queue.skip();
    if(!voiceme) await queue.join(voice);
    
    const status = await queue.playTrack(new CustomTrack(
      player,
      _radio.id,
      _radio.url
    ));
    if (!status) {
      i?.followUp("Something went wrong...");
    } else {
      // console.log(status)
      i?.followUp({
        content: `[🎧] Selected **${_radio.name}** to play at ${voice}`
      })
    }
  }
  @Slash({
    name: "stop",
    description: "Stop voice channel"
  })
  async leave(i: CommandInteraction) {
    await i?.deferReply({
      ephemeral: true
    })
    const player = this.player;
    const member = i?.member as GuildMember;
    const guild = i?.guild as DGuild;
    const me = i.guild?.members.me as GuildMember;
    const voice = member?.voice.channel as VoiceChannel;
    const voiceme = me?.voice.channel as VoiceChannel;
    
    const queue = player.queue(guild);
    if(!queue.isPlaying) return i?.editReply({
      content: "[❌] Nothing playing"
    });
    queue.leave();
    i?.deleteReply();
  }
}