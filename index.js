const { ReactionRoleManager } = require('discord.js-collector');
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType  } = require('discord.js');
const { BOT_TOKEN, prefix } = require('./bot.json');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const welcomer = require('./services/basic/welcomer.js');
const handleUnbans = require('./services/moderation/tempban.js');
const { setInterval } = require('timers');
const { backupRoles } = require('./services/moderation/backupRoles');
const { restoreRoles } = require('./services/moderation/restoreRoles');
const express = require('express')
const app = express()

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
});

// Function to recursively read command files from all subfolders
function readCommandsFromFolder(folderPath, commandMap) {
  const commandFiles = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file.name);

    if (file.isDirectory()) {
      // If the file is a directory, recurse into it
      readCommandsFromFolder(filePath, commandMap);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      // If the file is a .js file, load the command and add it to the command map
      const command = require(`./${filePath}`);
      commandMap.set(command.name, command);
    }
  }
}

// Load commands from the 'commands' folder (including subfolders)
const commands = new Map();
readCommandsFromFolder('./commands', commands);

// Connect to MongoDB and start the bot
mongoose
  .connect('mongodb+srv://discord:hx8xz7PVqOUVruby@demc-database.y2cemfb.mongodb.net/DEMC-DISCORD?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');

    app.get('/', function (req, res) {
      res.send('Hello World')
    })

    app.listen(3000)

    // Bot ready event (same as before)
    client.on('ready', async () => {

      const guild = client.guilds.cache.get('1009255172825956382');

      client.user.setStatus('idle');
      client.user.setActivity('Your Messages', { type: ActivityType.Watching });
      console.log(`Logged in as ${client.user.tag}`);

      let members = await guild.members.fetch();
        members.forEach(async (member) => {
          backupRoles(member);
      });

      setInterval(async () => {
        let members = await guild.members.fetch();
        members.forEach(async (member) => {
          backupRoles(member);
        });
      }, 300000);
    });

    client.on('guildMemberAdd', member => {
      welcomer.welcome(member);
      restoreRoles(member);
    });

    setInterval(() => handleUnbans(client), 1000);

    // Message event (same as before)
    client.on('messageCreate', (message) => {
      if (message.author.bot || !message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = commands.get(commandName);
      if (!command) {
        const unknownEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle('Unknown Command')
            .setDescription("Oops! Can't find the command you're looking for! Do `!help` for the command list!")
            .setTimestamp()
        message.reply({ embeds: [unknownEmbed]});
        return;
      }

      try {
        command.execute(message, args, client); // Pass the client object to the command
      } catch (error) {
        console.error(error);
        message.channel.send('An error occurred while executing the command.');
      }
    });

    client.login(BOT_TOKEN);
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
