const { PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const mongoose = require('mongoose');
const ms = require('ms'); // This package helps with converting time durations to milliseconds
const TempBan = require('../../models/tempban');

mongoose.connect('mongodb+srv://discord:hx8xz7PVqOUVruby@demc-database.y2cemfb.mongodb.net/DEMC-DISCORD?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


module.exports = {
  name: 'tempban',
  description: 'Temporarily bans someone',
  execute(message, args, client) {
    // Check if the user has permission to manage messages
    if (!message.member.permissions.has(PermissionsBitField.Flags.BAN_MEMBER)) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('You do not have permission to use this command.')
        .setTimestamp()
        .setFooter({ text: 'DEMC Helper'});
      return message.reply({ embeds: [noPermissionEmbed] });
    }

    const bannedRoleId = '1134108642916978758';
    const victim = message.mentions.members.first();
    const duration = args[1]; // Second argument for duration
    const reason = args.slice(2).join(' ') || 'No reason provided'; // Rest of the arguments for reason

    if(!victim) {
        const noVictimError = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Unspecified Victim')
        .setDescription('Please specify someone to temporarily ban!')
        .setTimestamp()
        .setFooter({ text: 'DEMC Helper'});
      return message.reply({ embeds: [noVictimError] });
    }

    if(victim.roles.cache.find(role => role.id === bannedRoleId)) {
      const alreadyBanned = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Victim Already Banned!')
        .setDescription('The user you tried to ban is already banned?')
        .setTimestamp()
        .setFooter({ text: 'DEMC Helper'});
      return message.reply({ embeds: [ alreadyBanned] });
    }

    if(!duration) {
      const noVictimError = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Unspecified Duration')
      .setDescription('How long do you wanna make them suffer?')
      .setTimestamp()
      .setFooter({ text: 'DEMC Helper'});
    return message.reply({ embeds: [noVictimError] });
  }

    const durationMillis = ms(duration);
    if(isNaN(durationMillis)) {
      const noVictimError = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Invalid Time')
      .setDescription('Invalid duration format. Example: 1w, 2d, 3h')
      .setTimestamp()
      .setFooter({ text: 'DEMC Helper'});
    return message.reply({ embeds: [noVictimError] });
  }
    

    // Create the tempban confirmation embed
    const embed = new EmbedBuilder()
      .setTitle('Confirm Ban Action')
      .setColor('#FF0000')
      .addFields(
        { name: 'Ban User:', value: victim.toString() },
        { name: 'Reason:', value: reason },
        { name: 'For:', value: duration },
        { name: 'By:', value: message.author.toString() }
      )
      .setTimestamp()
      .setFooter({ text: 'DEMC Helper'});

    // Create the buttons
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle('Danger');

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle('Secondary');

    // Create the action row with the buttons
    const actionRow = new ActionRowBuilder()
      .addComponents(confirmButton, cancelButton);

    // Send the tempban confirmation message with buttons
    message.channel.send({ embeds: [embed], components: [actionRow] })
      .then(async (sentMessage) => {
        // Collect the button interactions and handle the tempban action
        const filter = (interaction) => {
          return interaction.isButton() && interaction.user.id === message.author.id;
        };

        const collector = sentMessage.createMessageComponentCollector({ filter, time: 10000 }); // 10 seconds

        collector.on('collect', async (interaction) => {
          // Disable the buttons
          confirmButton.setDisabled(true);
          cancelButton.setDisabled(true);
          actionRow.components = [confirmButton, cancelButton];

          sentMessage.edit({ components: [actionRow] });

          if (interaction.customId === 'confirm') {
            // User clicked the "Confirm" button, perform the tempban action
            try {

              const banTimestamp = new Date();
              const unbanTimestamp = new Date(banTimestamp.getTime() + durationMillis);

              const tempBan = new TempBan({
                userId: victim.id,
                guildId: message.guild.id,
                banTimestamp,
                unbanTimestamp,
                reason,
              });
              const savedTempBan = await tempBan.save();
              const tempBanId = savedTempBan._id.toString();

              // Assign the banned role to the user
              victim.roles.add(bannedRoleId);

              // Send the tempban notification embed to the banned user
              const userEmbed = new EmbedBuilder()
                .setTitle('You\'ve Been Temporarily Banned!')
                .setDescription('Oh No! You\'ve been temporarily banned from the DEMC Discord Server! But don\'t worry, you can still submit an appeal in <#1133753120325914716>. Good luck on your appeal! (if you plan to)\n\nTempBan Information:')
                .addFields(
                  { name: 'Ban ID:', value: tempBanId},
                  { name: 'Reason:', value: reason},
                  { name: 'Duration:', value: duration}
                )
                .setTimestamp()
                .setColor('#FF0000')
                .setFooter({ text: 'DEMC Helper'});

              victim.send({ embeds: [userEmbed] }).catch(console.error);

              const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Ban Successful')
                .setDescription(`Successfully banned ${victim} for ${duration}!`)
                .setTimestamp()
                .setFooter({ text: 'DEMC Helper'});
                message.reply({ embeds: [successEmbed] });   
            } catch (error) {
              console.error(error);
              message.channel.send('An error occurred while performing the tempban action.');
            }
          } else if (interaction.customId === 'cancel') {
            // User clicked the "Cancel" button, cancel the tempban action
            const successCancelEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Ban Cancelled')
                .setDescription(`Successfully cancelled ban action`)
                .setTimestamp()
                .setFooter({ text: 'DEMC Helper'});
                message.reply({ embeds: [successCancelEmbed] });
          }
        });

        collector.on('end', (collected, reason) => {
          if (reason === 'time') {
            // Collector expired (10 seconds passed), remove the buttons
            confirmButton.setDisabled(true);
            cancelButton.setDisabled(true);
            actionRow.components = [confirmButton, cancelButton];
            sentMessage.edit({ components: [actionRow] });
          }
        });
      }).catch((error) => {
        console.error(error);
        message.reply('An error occurred while sending the tempban confirmation message.');
      });
  },
};
