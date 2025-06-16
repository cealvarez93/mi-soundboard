// index.cjs
require('dotenv').config();

const ytdl = require('ytdl-core');
const { Readable } = require('stream');
const { fetch } = require('undici');
const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  NoSubscriberBehavior
} = require('@discordjs/voice');

const play = require('play-dl'); // Sólo lo usamos para validar YT, si quieres puedes eliminarlo y usar ytdl-core para todo.
const ytdlDiscord = require('ytdl-core-discord');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('❌ Falta DISCORD_TOKEN en .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const SOUNDS = {
  luli_snack:             'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/luli_snack.mp4',
  salome:                 'https://cealvarez93.github.io/mi-soundboard/sounds/Salome.mp4',
  ni_fifes_ni_potaxies:   'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ni_fifes_ni_potaxies.mp4',
  hey_baby_girl:          'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hey_baby_girl.mp4',
  hay_una_fiesta:         'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hay_una_fiesta.mp4',
  veoveo:                 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/veoveo.mp4',
  devorame:               'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devorame.mp4',
  electronica:            'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/electronica.mp4',
  una_chica:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/una_chica.mp4',
  pop_lolita:             'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_lolita.mp4',
  pop_loleetah:           'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_loleetah.mp4',
  ci_ai_ci:               'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ci_ai_ci.mp4',
  devour_me:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devour_me.mp4',
  a_girl:                 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_girl.mp4',
  potaxio_potaxio:        'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/potaxio_potaxio.mp4',
  perre_vergue:           'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/perre_vergue.mp4',
  paremos_la_webada:      'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/paremos_la_webada.mp4',
  smack_him:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/smack_him.mp4',
  que_tiene_que_ver_esa_wea:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/que_tiene_que_ver_esa_wea.mp4',
  another_one:            'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/another_one.mp4',
  roblox:                 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/roblox.mp4',
  cuando_un_pvp:          'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/cuando_un_pvp.mp4',
  bubba_lullaby:          'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/bubba_lullaby.mp4',
  noviembre_sin_ti:       'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/noviembre_sin_ti.mp4',
  ven_conmigo:            'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ven_conmigo.mp4',
  no_mickey:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/no_mickey.mp4',
  esa_hembra:             'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/esa_hembra.mp4',
  rocko:                  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/rocko.mp4',
  tito_potaxie:           'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tito_potaxie.mp4',
  baila_puchaina:         'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/baila_puchaina.mp4',
  donde_estan_las_gatas:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/donde_estan_las_gatas.mp4',
  plus_20:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/plus_20.mp4',
  que_malcriados:         'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/que_malcriados.mp4',
  ken_lee:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ken_lee.mp4',
  can_you_say_hijo_de_la_gran_puta: 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/can_you_say_hijo_de_la_gran_puta.mp4',
  la_guadalupene:         'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/la_guadalupene.mp4',
  putologa:               'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/putologa.mp4',
  plains_of_eternity:     'https://www.youtube.com/watch?v=1p2dHxuUVig',
  chainsaw_man:           'https://www.youtube.com/watch?v=dFlDRhvM4L0',
  yo_quiero_un_heroe:     'https://www.youtube.com/watch?v=rUlr-flmDcA',
  mikaela:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/mikaela.mp4',
  y_me_le_ocurrio_otra_idea:   'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/y_me_le_ocurrio_otra_idea.mp4',
  milton_fajer:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/milton_fajer.mp4',
  negra_nieves:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/negra_nieves.mp4',
  poppers:                    'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/poppers.mp4',
  no_mi_nieta:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/no_mi_nieta.mp4',
  argentina_dbd:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/argentina_dbd.mp4',
  claudette_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/claudette_scream.mp4',
  claudette_hook:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/claudette_hook.mp4',
  feng_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/feng_scream.mp4',
  feng_hook:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/feng_hook.mp4',
  dwight_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/dwight_scream.mp4',
  dwight_hook:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/dwight_hook.mp4',
  meg_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/meg_scream.mp4',
  meg_hook:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/meg_hook.mp4',
  yunjin_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/yunjin_scream.mp4',
  yunjin_hook:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/yunjin_hook.mp4',
  ternura_abigail:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ternura_abigail.mp4',
  ternura_perra:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ternura_perra.mp4',
  tengo_puchaina:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tengo_puchaina.mp4',
  diles_barbara:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/diles_barbara.mp4',
  vistima:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/vistima.mp4',
  cocodrilo:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/cocodrilo.mp4',
  hola_perre_pute:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hola_perre_pute.mp4',
  a_mover_la_puchaina:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_mover_la_puchaina.mp4',
  bele_de_manteke:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/bele_de_manteke.mp4',
  careless_whisper:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/careless_whisper.mp4',
  arrasando:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/arrasando.mp4',
  tanza:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tanza.mp4',
  el_baile_de_puchaina:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/el_baile_de_puchaina.mp4',
};

// Guardamos el guildId donde está la conexión activa
let connGuildId = null;
// Bandera para saber si queremos mantener la conexión viva
let keepAlive = false;

// Creamos un solo AudioPlayer, compartido en todas las guilds
const player = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
});

// Listener de cambio de estado:
player.on('stateChange', (oldState, newState) => {
  console.log(`[AudioPlayer] ${oldState.status} ➔ ${newState.status}`);
   // Comentamos todo lo que desconecta al pasar a Idle:
  /*
  if (
    oldState.status === AudioPlayerStatus.Playing &&
    newState.status === AudioPlayerStatus.Idle
  ) {
    // Esperamos 2 segundos antes de desconectar
    setTimeout(() => {
      if (!keepAlive) {
        const conn = getVoiceConnection(connGuildId);
        if (conn) {
          conn.destroy();
          connGuildId = null;
        }
      } else {
        // Si en estos 2s se llamó a playResource nuevamente, reseteamos para la próxima
        keepAlive = false;
      }
    }, 10000);
  }
   */
});

player.on('error', e => console.error('[AudioPlayer ERROR]', e));

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Función auxiliar: reproduce el recurso y marca keepAlive
function playResource(resource) {
  keepAlive = true;
  player.play(resource);
}


client.on('interactionCreate', async (interaction) => {
  // 1) Autocomplete para /play
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused();
    const suggestions = Object.keys(SOUNDS)
      .filter(name => name.includes(focused.toLowerCase()))
      .slice(0, 25)
      .map(name => ({
        name: name.replace(/_/g, ' '),
        value: name
      }));
    await interaction.respond(suggestions);
    return;
  }

  // 2) /sounds — muestra el glosario
  if (interaction.isCommand() && interaction.commandName === 'sounds') {
    const list = Object.keys(SOUNDS)
      .map(name => `\`${name}\` — ${name.replace(/_/g, ' ')}`)
      .join('\n');
    await interaction.reply({ content: `**Glosario de sonidos:**\n${list}`, flags: 64 });
    return;
  }

  // 3) /play
  if (!interaction.isCommand() || interaction.commandName !== 'play') return;

  // 3.1) Verificar que el usuario esté en un canal de voz
  const member = interaction.member;
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: 'Debes estar en un canal de voz.', flags: 64 });
    return;
  }

  // 3.2) Verificar permisos del bot en ese canal
  const botMember = await interaction.guild.members.fetch(client.user.id);
  const perms = voiceChannel.permissionsFor(botMember);
  if (!perms.has('Connect') || !perms.has('Speak')) {
    await interaction.reply({
      content: 'Necesito permisos de Conectar y Hablar en ese canal.',
      flags: 64
    });
    return;
  }

  // 3.3) Crear o reutilizar la VoiceConnection para esta guild
  let conn = getVoiceConnection(interaction.guild.id);
  if (!conn) {
    conn = joinVoiceChannel({
      channelId:      voiceChannel.id,
      guildId:        interaction.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
    connGuildId = interaction.guild.id;

    conn.on('stateChange', (oldState, newState) => {
      console.log(`[VoiceConnection] ${oldState.status} ➔ ${newState.status}`);
    });
    conn.on('error', e => console.error('[VoiceConnection ERROR]', e));
  }

  // 3.4) Obtener la URL del sonido elegido
  const soundKey    = interaction.options.getString('name');
  let originalUrl = null;

  // 3.4.1) ¿“soundKey” parece una URL? (empeza con http:// o https://)
  if (/^https?:\/\//i.test(soundKey)) {
    // El usuario directamente puso una URL (p. ej. YouTube)
    originalUrl = soundKey;
  } else {
    // No arrancó con http(s), asumimos que es el “key” en el mapping SOUNDS
    originalUrl = SOUNDS[soundKey];
  }

  // 3.4.2) Si aún no tenemos URL válida, devolvemos error
  if (!originalUrl) {
    await interaction.reply({
      content: `❌ No encontré \`${soundKey}\`, ni es una URL que yo soporte.`,
      flags: 64
    });
    return;
  }

  // 3.5) Validar/encontrar si la “originalUrl” resultante es un video/playlist de YouTube
  let isYT = false;
  try {
    const ytType = await play.yt_validate(originalUrl);
    isYT = (ytType === 'video' || ytType === 'playlist');
  } catch (err) {
    // Si play.yt_validate lanza error, asumimos que NO es YouTube
    isYT = false;
  }

  let resource;
  if (isYT) {
    console.log(`🐛 Reproduciendo YouTube: ${originalUrl}`);
    try {
      // 1) Obtenemos el stream OPUS listo para Discord (ytdl-core-discord hace la precarga Opus)
      const opusStream = await ytdlDiscord(originalUrl, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        quality: 'highestaudio',
        requestOptions: {
          headers: {
            // simula un navegador moderno
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                          'Chrome/115.0.0.0 Safari/537.36'
          }
        }
      });

      // 2) Creamos el AudioResource marcándolo como StreamType.Opus
      resource = createAudioResource(opusStream, {
        inputType: StreamType.Opus,
        inlineVolume: true
      });
    } catch (err) {
      console.error('Error al reproducir YouTube con ytdl-core-discord:', err);
      return interaction.reply({
        content: '❌ Ocurrió un problema al reproducir ese video de YouTube.',
        flags: 64
      });
    }
  } else {
    // Si no es YouTube, asumimos que es la URL de un mp4 remoto (o webhook HTTP)
    console.log(`🐛 Reproduciendo MP4 directo: ${originalUrl}`);
    resource = createAudioResource(originalUrl, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    });
  }

  // Ajusta el volumen:  0 = silencio, 1 = volumen original, puedes probar algo como 0.5 (mitad)
  resource.volume.setVolume(0.7);
  // 3.6) Reproducir y suscribir el AudioPlayer
  player.play(resource);
  conn.subscribe(player);

  await interaction.reply({
    content: `▶️ Reproduciendo: **${soundKey.replace(/_/g, ' ')}**`,
    flags: 64
  });
});

client.login(TOKEN);
