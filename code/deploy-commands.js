// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const TOKEN = 'MTM3NjY0MzM5OTY0MTIwNjg0NA.Gb-RWh.-3oo8SZgjlMlYTPb98PkfVtIx1yvVxgceJgMt0';
const CLIENT_ID = '1376643399641206844';
const GUILD_ID  = '1280706676470579223';  // para registrar en tu servidor de pruebas

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce un sonido del soundboard')
    .addStringOption(opt =>
      opt.setName('name')
         .setDescription('Nombre del sonido')
         .setRequired(true)
         .addChoices(
           { name: 'coca',  value: 'coca'  },
           { name: 'salome', value: 'salome' }
         )
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands },
  );
  console.log('⚙️  Comandos registrados');
})();
