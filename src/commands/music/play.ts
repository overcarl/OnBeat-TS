import {
  Player,
  CustomTrack,
  Queue
} from '@discordx/music'
import {
  Router,
  Get
} from '@discordx/koa'
import type {
  Context
} from "koa";
import {
  Client,
  Discord,
  Guild,
  SelectMenuComponent,
  Slash,
  SlashGroup,
  SlashOption
} from 'discordx'
import type {
  CommandInteraction,
  Guild as DGuild,
  GuildMember,
  StringSelectMenuInteraction,
  AutocompleteInteraction,
  VoiceChannel
} from 'discord.js'
import moment from 'moment'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
  StringSelectMenuBuilder
} from 'discord.js'
import {
  bot
} from '../../main'
import sql from '../../Database'
@Discord()
@SlashGroup({
  name: "music",
  description: "Music commands"
})
@SlashGroup("music")
export class MusicCommands {
  _player = new Player();
  @Slash({
    name: "play",
    description: "Select a Radio to Play"
  })
  async play(@SlashOption({
    autocomplete: async function(interaction: AutocompleteInteraction) {
      const radios = await sql`
      SELECT * FROM radios ORDER BY created_at DESC, verified ASC;
      `
      // var selectRadios;
      const focusedValue = interaction.options.getFocused();
      if (focusedValue) {
        const selectRadios = radios.filter((r) => r?.name.includes(focusedValue)).map((r, i) => {
          var newBadge: boolean = false;
          const created = moment(r.created_at).format()
          const next = moment(created).add(2, 'days').format()
          if (moment().isSameOrBefore(next)) newBadge = true;
          return {
            name: `${newBadge ? "[NEW] " : ""}${r?.name}`,
            value: r?.id
          }
        })
        interaction.respond(selectRadios)
      } else {
        const radios_ = await sql`
      SELECT * FROM radios WHERE verified = true;
      `
        const selectRadios = radios.map((r, i) => {
          var newBadge: boolean = false;
          const created = moment(r.created_at).format()
          const next = moment(created).add(2, 'days').format()
          if (moment().isSameOrBefore(next)) newBadge = true;
          return {
            name: `${newBadge ? "[NEW] " : ""}${r?.name}`,
            value: r?.id
          }
        })
        interaction.respond(selectRadios)
      }
    },
    description: "Select radio stations",
    name: "radio",
    required: true,
    type: ApplicationCommandOptionType.String,
  }) radio: string, i: CommandInteraction) {
    const player = this.player;
    const member = i?.member as GuildMember;
    const guild = i?.guild as DGuild;
    const me = i.guild?.members.me as GuildMember;
    const voice = member?.voice.channel as VoiceChannel;
    const voiceme = me?.voice.channel as VoiceChannel;
    await i?.deferReply({
      ephemeral: true
    })
    // const radio = radio;
    const radios = await sql`
      SELECT * FROM radios WHERE id = ${radio}
      `;
    const _radio = radios[0];
    if (!_radio) return i?.editReply({
      content: `[🔍] I couldn't find a radio with the name or id ${radio}`
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
    const status = await queue.playTrack(new CustomTrack(player, _radio.id, _radio.url));
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
    name: "playing",
    description: "See what radio is playing"
  })
  async playing(i: CommandInteraction) {
    const player = this.player;
    const member = i?.member as GuildMember;
    const guild = i?.guild as DGuild;
    const me = guild?.members.me as GuildMember;
    const voice = member?.voice.channel as VoiceChannel;
    const voiceme = me?.voice.channel as VoiceChannel;
    const queue = player.queue(guild);
    if (!queue.isPlaying) return i?.reply({
      content: "[❌] Nothing playing",
      ephemeral: true
    });
    const current = queue.currentTrack;
    const radio = await sql`
      SELECT * FROM radios WHERE id=${current?.metadata.title as string}
      `
    const embed = new EmbedBuilder().setTitle("🎵 • Playing").addFields({
      name: "📻 • Radio",
      value: radio[0].name,
      inline: true
    }).setColor(0xe900FF)
    i.reply({
      embeds: [embed]
    })
    return current;
  }
  @Slash({
    name: "volume",
    description: "Sets volume to Music"
  })
  async volume(@SlashOption({
    name: "number",
    description: "Volume from 0 to 100",
    type: ApplicationCommandOptionType.Number,
    required: false
  }) vol: number, i: CommandInteraction) {
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
  get player() {
    return this._player;
  }
  queue(guild: DGuild) {
    return this.player.queue(guild)
  }
}