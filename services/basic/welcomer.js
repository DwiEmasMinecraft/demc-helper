const {EmbedBuilder} = require('discord.js')

module.exports = {
    welcome(member) {
      const channel = member.guild.channels.cache.get('1135156966113689620');
      if (!channel) return;
      const welcomeEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`Welcome, ${member.user.username}!`)
            .setDescription(`Welcome to DEMC!\nHave a great stay and happy gaming!\n[${member}]`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: 'DEMC Helper'});
    channel.send({ embeds: [welcomeEmbed]});
    }
  };