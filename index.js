// index.js
require('dotenv').config();
console.log('> Token cargado:', process.env.DISCORD_TOKEN ? '[OK]' : '[NO]');  // DEBUG
const { Client, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('❌ Falta DISCORD_TOKEN en .env');
  process.exit(1);
}

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
  luli_snack: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/luli_snack.mp4',
  salome:  'https://cealvarez93.github.io/mi-soundboard/sounds/Salome.mp4',
  tregua:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tregua.mp4',
  ni_fifes_ni_potaxies:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ni_fifes_ni_potaxies.mp4',
  hey_baby_girl:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hey_baby_girl.mp4',
  hay_una_fiesta: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hay_una_fiesta.mp4',
  veoveo: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/veoveo.mp4',
  devorame: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devorame.mp4',
  electronica: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/electronica.mp4',
  una_chica: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/una_chica.mp4',
  me_teni_chata: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/me_teni_chata.mp4',
  pop_lolita: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_lolita.mp4',
  pop_loleetah: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_loleetah.mp4',
  ci_ai_ci: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ci_ai_ci.mp4',
  devour_me: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devour_me.mp4',
  a_girl: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_girl.mp4',
  potaxio_potaxio: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/potaxio_potaxio.mp4',
  perre_vergue: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/perre_vergue.mp4',
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
