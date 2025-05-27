// deploy-commands.js
require('dotenv').config();
const TOKEN = process.env.DISCORD_TOKEN;
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID  = process.env.DISCORD_GUILD_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce un sonido del soundboard')
    .addStringOption(opt =>
      opt.setName('name')
         .setDescription('Nombre del sonido')
         .setRequired(true)
         .addChoices(
           { name: 'luli_snack',  value: 'luli_snack'  },
           { name: 'salome', value: 'salome' },
           { name: 'tregua', value: 'tregua' },
           { name: 'ni_fifes_ni_potaxies', value: 'ni_fifes_ni_potaxies' },
           { name: 'hey_baby_girl', value: 'hey_baby_girl' },
           { name: 'hay_una_fiesta', value: 'hay_una_fiesta' },
           { name: 'veoveo', value: 'veoveo' },
           { name: 'devorame', value: 'devorame' },
           { name: 'electronica', value: 'electronica' },
           { name: 'una_chica', value: 'una_chica' },
           { name: 'me_teni_chata', value: 'me_teni_chata' },
           { name: 'pop_lolita', value: 'pop_lolita' },
           { name: 'pop_loleetah', value: 'pop_loleetah' },
           { name: 'ci_ai_ci', value: 'ci_ai_ci' },
           { name: 'devour_me', value: 'devour_me' },
           { name: 'a_girl', value: 'a_girl' },
           { name: 'potaxio_potaxio', value: 'potaxio_potaxio' },
           { name: 'perre_vergue', value: 'perre_vergue' },
           { name: 'paremos_la_webada', value: 'paremos_la_webada' }
         )
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN).setAgent(new (require('undici').Agent)({ connect: { timeout: 30000 } }));
(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands },
  );
  console.log('⚙️  Comandos registrados');
})();
