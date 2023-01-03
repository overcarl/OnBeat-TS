import type {
  VoiceServerUpdate,
  VoiceStateUpdate,
} from "@discordx/lava-player";
import { Node } from "@discordx/lava-player";
import { GatewayDispatchEvents } from "discord.js";
import type { Client } from "discordx";

export function getNode(client: Client): Node {
  const nodeX = new Node({
    host: {
      address: process.env.LAVA_HOST ?? "localhost",
      port: process.env.LAVA_PORT ? Number(process.env.LAVA_PORT) : 2333,
    },

    password: process.env.LAVA_PASSWORD ?? "",

    send(guildId, packet) {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        guild.shard.send(packet);
      }
    },
    shardCount: 0,
    userId: "916373041460703282",
  });

  client.ws.on(
    GatewayDispatchEvents.VoiceStateUpdate,
    (data: VoiceStateUpdate) => {
      nodeX.voiceStateUpdate(data);
    }
  );

  client.ws.on(
    GatewayDispatchEvents.VoiceServerUpdate,
    (data: VoiceServerUpdate) => {
      nodeX.voiceServerUpdate(data);
    }
  );

  return nodeX;
}