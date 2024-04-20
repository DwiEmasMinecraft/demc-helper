const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Lists all commands',
    execute(message, args, client) {
        const helpEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle('Commands List')
            .setDescription(`All Of My Commands! all [] are required values while () are optional!`)
            .addFields(
                { name: 'Basic Commands', value: 'Basic Runnable Commands!' },
                { name: '!ping', value: 'Checks the latency between you and the bot!' },
                { name: '!help:', value: 'You just ran it.' },
                { name: 'Moderation Commands', value: 'All Moderation Commands!' },
                { name: '!ban [@user] (reason)', value: 'Bans the mentioned user.' },
                { name: '!tempban [@user] [duration] (reason)', value: 'Temporarily bans the mentioned user. Durations like `1w` or `1d` are accepted.' },
                { name: '!purge [amount]', value: 'Purges Messages, `amount` must be a range between `1-100` or `all`' }
              )
            .setTimestamp()
            .setFooter({ text: 'DEMC Helper'});
        message.reply({ embeds: [helpEmbed]});
    },
  };
  