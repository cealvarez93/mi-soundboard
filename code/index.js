// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const TOKEN = process.env.DISCORD_TOKEN;
const { joinVoiceChannel,
         createAudioPlayer,
         createAudioResource,
         StreamType,
         NoSubscriberBehavior } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const SOUNDS = {
  luli_snack:   'https://cealvarez93.github.io/mi-soundboard/sounds/luli_snack.mp4',
  salome:  'https://cealvarez93.github.io/mi-soundboard/sounds/Salome.mp4',
};

const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Responder a slash command /play
client.on('interactionCreate', async (i) => {
  if (!i.isCommand()) return;
  if (i.commandName === 'play') {
    const sound = i.options.getString('name');
    const url = SOUNDS[sound];
    if (!url) {
      return i.reply({ content: `Desconozco el sonido \`${sound}\`.`, ephemeral: true });
    }
    const member = i.member;
    const channel = member.voice.channel;
    if (!channel) {
      return i.reply({ content: 'Debes estar en un canal de voz primero.', ephemeral: true });
    }
    // Conectar y reproducir
    const conn = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    const resource = createAudioResource(url);
    player.play(resource);
    conn.subscribe(player);
    await i.reply({ content: `▶️ Reproduciendo: **${sound}**`, ephemeral: false });
  }
});

client.login(TOKEN);
