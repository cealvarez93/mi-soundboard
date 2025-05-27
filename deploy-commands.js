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
           { name: 'salome', value: 'salome' }
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
