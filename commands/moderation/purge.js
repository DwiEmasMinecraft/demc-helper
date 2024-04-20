const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Purge messages from the channel',
  execute(message, args, client) {
    // Check if the user has permission to manage messages
    if (!message.member.permissions.has(PermissionsBitField.Flags.MANAGE_MESSAGES)) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('You do not have permission to use this command.')
        .setTimestamp();
      return message.reply({ embeds: [noPermissionEmbed] });
    }

    // Check if a valid amount of messages is specified
    let amount = parseInt(args[0]);
    if (!args[0] || args[0].toLowerCase() != 'all' && isNaN(amount)) {
      const invalidAmountEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Invalid Amount')
        .setDescription('Please provide a valid number of messages to purge.')
        .setTimestamp();
      return message.reply({ embeds: [invalidAmountEmbed] });
    }

    // Create the tempban confirmation embed
    const embed = new EmbedBuilder()
      .setTitle('Confirm Purge Action')
      .setColor('#FF0000')
      .setDescription(`Purging ${args[0]} amount of messages`)
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
              // If 'all' is specified, delete all messages in the channel
              if (args[0].toLowerCase() === 'all') {
                try {
                  message.channel.clone().then((newChannel) => {
                    newChannel.setPosition(message.channel.position);
                    message.channel.delete();
                  });
                } catch (error) {
                  console.error('Error while deleting channel:', error);
                  const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('An error occurred while deleting the channel.')
                    .setTimestamp();
                  return message.reply({ embeds: [errorEmbed] });
                }
              } else {
              // Otherwise, delete the specified number of messages
              try {
                message.channel.bulkDelete(amount);
              } catch (error) {
                console.error('Error while deleting messages:', error);
                const errorEmbed = new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle('Error')
                  .setDescription('An error occurred while deleting messages.')
                  .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
              }
            }
            const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Purge Successful')
            .setDescription(`Successfully deleted ${args[0]} messages!`)
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
                .setTitle('Purge Cancelled')
                .setDescription(`Successfully cancelled purge action`)
                .setTimestamp()
                .setFooter({ text: 'DEMC Helper'});
                message.reply({ embeds: [successCancelEmbed] });
          }
        })})}};