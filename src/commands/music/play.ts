import { Player, CustomTrack, Queue } from '@discordx/music'
import { Client, Discord, Guild, SelectMenuComponent, Slash, SlashGroup, SlashOption } from 'discordx'
import type {
  CommandInteraction,
  Guild as DGuild,
  GuildMember,
  StringSelectMenuInteraction,
  VoiceChannel
} from 'discord.js'
import moment from 'moment'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
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
export class MusicCommands {
  player;
  get playerBot() {
    return this.player;
  }
  constructor() {
    this.player = new Player();
  }
  @Slash({
    name: "play",
    description: "Select a Radio to Play"
  })
  async play(interaction: CommandInteraction) {
    const radios = await sql`
      SELECT * FROM radios ORDER BY created_at DESC, name ASC;
      `
    const selectRadios = radios.map((r, i) => {
      var newBadge: boolean = false;
      const created = new Date(r?.created_at)
      const now = new Date()
      if (moment(created).isSame(now, 'month') && moment(created).isSame(now, 'year')) newBadge = true;
      if (r.description) return {
        label: `${r?.verified ? "[✅] " : ""}${newBadge ? "[NEW] " : ""}${r.name}`,
        description: r.description,
        value: r.id
      }; else return {
        label: `${r?.verified ? "[✅] " : ""}${newBadge ? "[NEW] " : ""}${r.name}`,
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
    if (!voice) return i?.editReply({
      content: "[❌] Join on a Voice Channel"
    });
    const queue = player.queue(guild);
    if (queue.isPlaying) await queue.skip();
    if (!voiceme) await queue.join(voice);
    if (queue.isPlaying && voice !== voiceme) return i?.editReply({
      content: "[❌] You are not on the same voice channel as me."
    });
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
    if (!voice) return i?.editReply({
      content: "[❌] Join on a Voice Channel"
    });
    if (!queue.isPlaying) return i?.editReply({
      content: "[❌] Nothing playing"
    });
    if (voice.id !== voiceme.id) return i?.editReply({
      content: "[❌] You are not on the same voice channel as me."
    });
    queue.leave();
    i?.deleteReply();
  }
  @Slash({
    name: "volume",
    description: "Sets volume to Music"
  })
  async volume(
    @SlashOption({
      name: "number",
      description: "Volume from 0 to 100",
      type: ApplicationCommandOptionType.Number,
      required: false
    })
    vol: number,
    i: CommandInteraction) {
    await i?.deferReply({
      ephemeral: true
    })
    const player = this.player;
    const member = i?.member as GuildMember;
    const guild = i?.guild as DGuild;
    const me = guild?.members.me as GuildMember;
    const voice = member?.voice.channel as VoiceChannel;
    const voiceme = me?.voice.channel as VoiceChannel;

    const queue = player.queue(guild);
    if (!voice) return i?.editReply({
      content: "[❌] Join on a Voice Channel"
    });
    if (!queue.isPlaying) return i?.editReply({
      content: "[❌] Nothing playing"
    });
    if (voice.id !== voiceme.id) return i?.editReply({
      content: "[❌] You are not on the same voice channel as me."
    });
    if (!vol) return i?.editReply({
      content: `[🔊] **${queue?.volume}**%`,
    })

    queue?.setVolume(vol);
    i?.editReply({
      content: `[🔊] Volume changed to **${vol}**%`
    })
  }
}