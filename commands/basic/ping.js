const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Ping command',
    execute(message, args, client) {
        const ping = Math.abs(Date.now() - message.createdTimestamp);
        const pingEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle('Ping')
            .setDescription(`🏓 ・ Pong! The latency is: ${ping}ms!`)
            .setTimestamp()
            .setFooter({ text: 'DEMC Helper'});
        message.reply({ embeds: [pingEmbed]});
    },
  };
  