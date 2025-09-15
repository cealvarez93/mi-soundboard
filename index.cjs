// index.cjs
require('dotenv').config();

//const ytdl = require('ytdl-core');
const { Readable } = require('stream');
const { fetch } = require('undici');
const { Client, GatewayIntentBits } = require('discord.js');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
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
//const ytdlDiscord = require('ytdl-core-discord');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('❌ Falta DISCORD_TOKEN en .env');
  process.exit(1);
}

const MAX_PER_PAGE = 20; 
const sessions = new Map(); // para trackear en qué página está cada user

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const SOUNDS = {
  luli_snack:             'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/luli_snack.mp4',
  salome:                 'https://cealvarez93.github.io/mi-soundboard/sounds/Salome.mp4',
  ni_fifes_ni_potaxies:   'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ni_fifes_ni_potaxies.mp4',
  hey_baby_girl:          'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hey_baby_girl.mp4',
  veoveo:                 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/veoveo.mp4',
  devorame:               'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devorame.mp4',
  electronica:            'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/electronica.mp4',
  una_chica:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/una_chica.mp4',
  me_teni_chata:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/me_teni_chata.mp4',
  pop_lolita:             'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_lolita.mp4',
  pop_loleetah:           'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pop_loleetah.mp4',
  ci_ai_ci:               'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ci_ai_ci.mp4',
  devour_me:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/devour_me.mp4',
  a_girl:                 'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_girl.mp4',
  potaxio_potaxio:        'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/potaxio_potaxio.mp4',
  perre_vergue:           'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/perre_vergue.mp4',
  paremos_la_webada:      'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/paremos_la_webada.mp4',
  smack_him:              'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/smack_him.mp4',
  plus_20_air:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/plus_20_air.mp4',
  plus_20_wood:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/plus_20_wood.mp4',
  another_one:            'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/another_one.mp4',
  que_tiene_que_ver_esa_wea:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/que_tiene_que_ver_esa_wea.mp4',
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
  hay_una_fiesta:         'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hay_una_fiesta.mp4',
  donde_estan_las_gatas:  'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/donde_estan_las_gatas.mp4',
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
  taurie_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/taurie_scream.mp4',
  ternura_abigail:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ternura_abigail.mp4',
  ternura_perra:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ternura_perra.mp4',
  tengo_puchaina:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tengo_puchaina.mp4',
  diles_barbara:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/diles_barbara.mp4',
  vistima:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/vistima.mp4',
  cocodrilo:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/cocodrilo.mp4',
  hola_perre_pute:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hola_perre_pute.mp4',
  a_mover_la_puchaina:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_mover_la_puchaina.mp4',
  bele_de_manteke:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/bele_de_manteke.mp4',
  arrasando:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/arrasando.mp4',
  tanza:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tanza.mp4',
  el_baile_de_puchaina:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/el_baile_de_puchaina.mp4',
  chupalo_entonces:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/chupalo_entonces.mp4',
  y_el_pico:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/y_el_pico.mp4',
  que_te_sorprende:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/que_te_sorprende.mp4',
  saludo_anali:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/saludo_anali.mp4',
  saludo_elsa:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/saludo_elsa.mp4',
  saludo_rosa:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/saludo_rosa.mp4',
  saludo_elba:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/saludo_elba.mp4',
  saludo_maria:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/saludo_maria.mp4',
  crees_en_santa:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/crees_en_santa.mp4',
  me_enamore_de_un_fifx:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/me_enamore_de_un_fifx.mp4',
  no_soy_tu_bro:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/no_soy_tu_bro.mp4',
  como_va_su_die:               'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/como_va_su_die.mp4',
  con_el_de_sharpie:            'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/con_el_de_sharpie.mp4',
  felez_neveded:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/felez_neveded.mp4',
  no_seas_tente_mi_bebe:        'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/no_seas_tente_mi_bebe.mp4',
  vieja_mitotera:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/vieja_mitotera.mp4',
  silencio_gay:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/silencio_gay.mp4',
  hyakuretsukyaku:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hyakuretsukyaku.mp4',
  tenshokyaku:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/tenshokyaku.mp4',
  kikoken:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/kikoken.mp4',
  kikosho:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/kikosho.mp4',
  gomen_ne:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/gomen_ne.mp4',
  date_prisa:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/date_prisa.mp4',
  me_muero:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/me_muero.mp4',
  fallaste:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/fallaste.mp4',
  si_senor:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/si_senor.mp4',
  nuu:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/nuu.mp4',
  enemigo:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/enemigo.mp4',
  cof:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/cof.mp4',
  ya_te_pillare:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ya_te_pillare.mp4',
  ay:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ay.mp4',
  a_correr:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/a_correr.mp4',
  estas_loco:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/estas_loco.mp4',
  ahi_viene:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ahi_viene.mp4',
  chao:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/chao.mp4',
  bye_felicia:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/bye_felicia.mp4',
  aleluya:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/aleluya.mp4',
  n_word:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/n_word.mp4',
  gato_ton:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/gato_tom.mp4',
  die_bitch:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/die_bitch.mp4',
  too_easy:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/too_easy.mp4',
  loser:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/loser.mp4',
  oh_yeah:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/oh_yeah.mp4',
  escucha_las_palabras:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/escucha_las_palabras.mp4',
  hana_ni_natte:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/hana_ni_natte.mp4',
  she_was_a_fairy:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/she_was_a_fairy.mp4',
  rosas:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/rosas.mp4',
  be_my_lover:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/be_my_lover.mp4',
  penelope:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/penelope.mp4',
  la_polizia_no:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/la_polizia_no.mp4',
  me_mataron:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/me_mataron.mp4',
  la_gata:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/la_gata.mp4',
  bailo:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/bailo.mp4',
  careless_whisper:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/careless_whisper.mp4',
  zelda_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/zelda_scream.mp4',
  daisy_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/daisy_scream.mp4',
  puff_scream:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/puff_scream.mp4',
  jigglypuff:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/jigglypuff.mp4',
  yooooo:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/yooooo.mp4',
  desesperada:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/desesperada.mp4',
  arrg_arrg:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/arrg_arrg.mp4',
  spirit_arrg:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/spirit_arrg.mp4',
  myers_arrg:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/arrg.mp4',
  arrua:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/arrua.mp4',
  arria:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/arria.mp4',
  oh_no:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/oh_no.mp4',
  my_little_pussy:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/my_little_pussy.mp4',
  me_electrocutaste:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/me_electrocutaste.mp4',
  meo_o_parisi:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/meo_o_parisi.mp4',
  con_calma:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/con_calma.mp4',
  ocarina_of_can_1:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_1.mp4',
  ocarina_of_can_2:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_2.mp4',
  ocarina_of_can_3:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_3.mp4',
  ocarina_of_can_4:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_4.mp4',
  ocarina_of_can_5:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_5.mp4',
  ocarina_of_can_6:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_6.mp4',
  ocarina_of_can_7:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_7.mp4',
  ocarina_of_can_8:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/ocarina_of_can_8.mp4',
  cara_de_cuica:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/cara_de_cuica.mp4',
  kakegurui:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/kakegurui.mp4',
  yo_me_nutro:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/yo_me_nutro.mp4',
  period:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/period.mp4',
  fergie:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/fergie.mp4',
  myers_tier2:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/myers_tier2.mp4',
  myers_tier3:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/myers_tier3.mp4',
  mario:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/mario.mp4',
  luigi:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/luigi.mp4',
  dona_leticie:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/dona_leticie.mp4',
  jet2:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/jet2.mp4',
  celia_potaxie:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/celia_potaxie.mp4',
  africana:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/africana.mp4',
  pajarita:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/pajarita.mp4',
  mi_hijo_es_negro:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/mi_hijo_es_negro.mp4',
  la_consentida:                'https://raw.githubusercontent.com/cealvarez93/mi-soundboard/main/sounds/la_consentida.mp4',

};

// Guardamos el guildId donde está la conexión activa
let connGuildId = null;
// Bandera para saber si queremos mantener la conexión viva
let keepAlive = false;

// Creamos un solo AudioPlayer, compartido en todas las guilds
const player = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
});

async function handlePlay(interaction, soundKey) {
  const member = interaction.member;
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: 'Debes estar en un canal de voz.', flags: 64 });
    return;
  }

  const botMember = await interaction.guild.members.fetch(client.user.id);
  const perms = voiceChannel.permissionsFor(botMember);
  if (!perms.has('Connect') || !perms.has('Speak')) {
    await interaction.reply({
      content: 'Necesito permisos de Conectar y Hablar en ese canal.',
      flags: 64
    });
    return;
  }

  let conn = getVoiceConnection(interaction.guild.id);
  if (!conn) {
    conn = joinVoiceChannel({
      channelId:      voiceChannel.id,
      guildId:        interaction.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
    connGuildId = interaction.guild.id;
  }

  let originalUrl = /^https?:\/\//i.test(soundKey) ? soundKey : SOUNDS[soundKey];
  if (!originalUrl) {
    await interaction.reply({
      content: `❌ No encontré \`${soundKey}\`, ni es una URL que yo soporte.`,
      flags: 64
    });
    return;
  }

  let isYT = false;
  try {
    const ytType = await play.yt_validate(originalUrl);
    isYT = (ytType === 'video' || ytType === 'playlist');
  } catch {}

  let resource;
  try {
    if (isYT) {
      // stream directo con play-dl, compatible con @discordjs/voice
      const { stream, type } = await play.stream(originalUrl, {
        discordPlayerCompatibility: true
      });

      resource = createAudioResource(stream, {
        inputType: type,          // play-dl te dice el tipo correcto (Opus/WebM/etc.)
        inlineVolume: true
      });
    } else {
      resource = createAudioResource(originalUrl, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });
    }

    resource.volume.setVolume(1);
    player.play(resource);
    conn.subscribe(player);
  } catch (err) {
    console.error('Error al reproducir sonido:', err);
    await interaction.reply({ content: '❌ Error al reproducir el sonido.', flags: 64 });
    return;
  }

  if (interaction.isButton && interaction.isButton()) {
    await interaction.deferUpdate(); // 👈 No muestra mensaje, no mueve el panel
  } else {
    await interaction.reply({
      content: `▶️ Reproduciendo: **${soundKey.replace(/_/g, ' ')}**`,
      flags: 64
    });
  }
}


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

  // /panel
  if (interaction.isCommand() && interaction.commandName === 'panel') {
    const allKeys = Object.keys(SOUNDS);
    const totalPages = Math.ceil(allKeys.length / MAX_PER_PAGE);
    const userId = interaction.user.id;
    const currentPage = 0;
    sessions.set(userId, currentPage);

    const start = currentPage * MAX_PER_PAGE;
    const end = start + MAX_PER_PAGE;
    const keys = allKeys.slice(start, end);

    const rows = [];
    for (let i = 0; i < Math.min(keys.length, 20); i += 5) {
    const row = new ActionRowBuilder();
    keys.slice(i, i + 5).forEach(key => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`play_${key}`)
          .setLabel(key.replace(/_/g, ' ').slice(0, 80))
          .setStyle(ButtonStyle.Primary)
      );
    });
    rows.push(row);
  }

    const navRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_prev')
          .setLabel('⬅️ Anterior')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('panel_next')
          .setLabel('Siguiente ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === totalPages - 1)
      );

    rows.push(navRow);

    await interaction.reply({
      content: `🎛️ Panel de sonidos (página 1 de ${totalPages})`,
      components: rows
    });
    return;
  }


  // /play
  if (interaction.isCommand() && interaction.commandName === 'play') {
    // Acepta 'name'... y cae a cualquier valor disponible si el cliente no lo envía bien
    const soundKey =
      interaction.options.getString('name') ??
      interaction.options.getString('url') ??              // por si más adelante agregas 'url'
      interaction.options?.data?.[0]?.value ?? null;       // último recurso

    if (!soundKey) {
      await interaction.reply({
        content: '⚠️ Debes indicar un nombre o URL. Usa **/play** y rellena el campo **name** (ej: `https://www.youtube.com/watch?v=co-TFLbaZAE` o `luli_snack`).',
        ephemeral: true
      });
      return;
    }
    console.log('options data:', interaction.options?.data);
    await handlePlay(interaction, soundKey);
    return;
  }



  // Botones
  if (interaction.isButton()) {
    const { customId, user } = interaction;

    if (customId.startsWith('play_')) {
      const soundKey = customId.replace('play_', '');
      await handlePlay(interaction, soundKey); // 🔥 esta es la forma correcta
      return;
    }

    if (customId === 'panel_next' || customId === 'panel_prev') {
      const allKeys = Object.keys(SOUNDS);
      const totalPages = Math.ceil(allKeys.length / MAX_PER_PAGE);
      const userId = user.id;
      let currentPage = sessions.get(userId) ?? 0;

      currentPage = customId === 'panel_next'
        ? Math.min(currentPage + 1, totalPages - 1)
        : Math.max(currentPage - 1, 0);

      sessions.set(userId, currentPage);

      const start = currentPage * MAX_PER_PAGE;
      const end = start + MAX_PER_PAGE;
      const keys = allKeys.slice(start, end);

      const rows = [];
      for (let i = 0; i < keys.length; i += 5) {
        const row = new ActionRowBuilder();
        keys.slice(i, i + 5).forEach(key => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`play_${key}`)
              .setLabel(key.replace(/_/g, ' ').slice(0, 80))
              .setStyle(ButtonStyle.Primary)
          );
        });
        rows.push(row);
      }

      const navRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('panel_prev')
            .setLabel('⬅️ Anterior')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('panel_next')
            .setLabel('Siguiente ➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === totalPages - 1)
        );

      rows.push(navRow);

      await interaction.update({
        content: `🎛️ Panel de sonidos (página ${currentPage + 1} de ${totalPages})`,
        components: rows
      });
    }
  }
});

client.login(TOKEN);
