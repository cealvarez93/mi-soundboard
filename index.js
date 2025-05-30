// index.js
require('dotenv').config();
console.log('> Token cargado:', process.env.DISCORD_TOKEN ? '[OK]' : '[NO]');  // DEBUG
const { Client, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;
const ytdl = require('ytdl-core');

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
  ni_fifes_ni_potaxies:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ni_fifes_ni_potaxies.mp4',
  hey_baby_girl:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hey_baby_girl.mp4',
  hay_una_fiesta: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hay_una_fiesta.mp4',
  veoveo: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/veoveo.mp4',
  devorame: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devorame.mp4',
  electronica: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/electronica.mp4',
  una_chica: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/una_chica.mp4',
  pop_lolita: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_lolita.mp4',
  pop_loleetah: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_loleetah.mp4',
  ci_ai_ci: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ci_ai_ci.mp4',
  devour_me: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devour_me.mp4',
  a_girl: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_girl.mp4',
  potaxio_potaxio: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/potaxio_potaxio.mp4',
  perre_vergue: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/perre_vergue.mp4',
  paremos_la_webada: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/paremos_la_webada.mp4',
  smack_him: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/smack_him.mp4',
  que_tiene_que_ver_esa_wea: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/que_tiene_que_ver_esa_wea.mp4',
  another_one: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/another_one.mp4',
  roblox: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/roblox.mp4',
  cuando_un_pvp: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/cuando_un_pvp.mp4',
  bubba_lullaby: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/bubba_lullaby.mp4',
  noviembre_sin_ti: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/noviembre_sin_ti.mp4',
  ven_conmigo: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ven_conmigo.mp4',
  no_mickey: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/no_mickey.mp4',
  esa_hembra: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/esa_hembra.mp4',
  rocko: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/rocko.mp4',
  tito_potaxie: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tito_potaxie.mp4',
  baila_puchaina: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/baila_puchaina.mp4',
  donde_estan_las_gatas: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/donde_estan_las_gatas.mp4',
  plus_20: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/plus_20.mp4',
  que_malcriados: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/que_malcriados.mp4',
  ken_lee: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ken_lee.mp4',
  can_you_say_hijo_de_la_gran_puta: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/can_you_say_hijo_de_la_gran_puta.mp4',
  la_guadalupene: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/la_guadalupene.mp4',
  putologa: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/putologa.mp4',
  plains_of_eternity: 'https://www.youtube.com/watch?v=1p2dHxuUVig&list=RDPVPv0IF-D64&index=6',
};

const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Responder a slash command /play
client.on('interactionCreate', async (i) => {
  // Autocompletado
  if (i.isAutocomplete()) {
    const focused = i.options.getFocused();
    const filtered = Object.keys(SOUNDS).filter(name =>
      name.toLowerCase().includes(focused.toLowerCase())
    );
    await i.respond(
      filtered.slice(0, 25).map(name => ({
        name: name.replace(/_/g, ' '),
        value: name
      }))
    );
    return;
  }

    // Comando /sounds: muestra el glosario
  if (i.isCommand() && i.commandName === 'sounds') {
    const soundList = Object.keys(SOUNDS)
      .map(name => `\`${name}\` — ${name.replace(/_/g, ' ')}`)
      .join('\n');

    return i.reply({
      content: `**Glosario de sonidos disponibles:**\n${soundList}`,
      ephemeral: true
    });
  }

  // Comando /play
  if (!i.isCommand()) return;
  if (i.commandName === 'play') {

    // Verifica que esté en el canal correcto
    if (i.channelId !== '1280706676470579226') {
      return i.reply({
        content: '❌ Este comando solo se puede usar en `#clips-y-destacados`.',
        ephemeral: true
      });
    }

    const sound = i.options.getString('name');

    // 1) Si es URL de YouTube
    if (ytdl.validateURL(sound)) {
      const channel = i.member.voice.channel;
      if (!channel) return i.reply({ content: 'Debes estar en un canal de voz.', ephemeral: true });
      const conn = joinVoiceChannel({ channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
      const stream = ytdl(sound, { filter: 'audioonly', quality: 'highestaudio' });
      const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
      player.play(resource);
      conn.subscribe(player);
      return i.reply({ content: `▶️ Reproduciendo YouTube: <${sound}>` });
    }

    // 2) Si es un sonido del objeto SOUNDS
    const url = SOUNDS[sound];
    if (!url) {
      return i.reply({ content: `Desconozco el sonido \`${sound}\`.`, ephemeral: true });
    }
    const member = i.member;
    const channel = member.voice.channel;
    if (!channel) {
      return i.reply({ content: 'Debes estar en un canal de voz primero.', ephemeral: true });
    }

    const conn = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const resource = createAudioResource(url);
    player.play(resource);
    conn.subscribe(player);
    await i.reply({ content: `▶️ Reproduciendo: **${sound.replace(/_/g, ' ')}**`, ephemeral: false });
  }
});

client.login(TOKEN);
