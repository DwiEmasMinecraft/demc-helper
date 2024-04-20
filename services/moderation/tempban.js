const mongoose = require('mongoose');
const bannedRoleId = '1134108642916978758';
const TempBan = require('../../models/tempban');

mongoose.connect('mongodb+srv://discord:hx8xz7PVqOUVruby@demc-database.y2cemfb.mongodb.net/DEMC-DISCORD?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function handleUnbans(client) {
    try {
      const currentTime = new Date();
      const usersToUnban = await TempBan.find({
        unbanTimestamp: { $lte: currentTime },
        wasUnbanned: false
      });
  
      for (const user of usersToUnban) {
        const guild = await client.guilds.fetch(user.guildId);
        const member = await guild.members.fetch(user.userId);
  
        if (member) {
          member.roles.remove(bannedRoleId);
          await TempBan.updateOne({ _id: user._id }, { wasUnbanned: true });
  
          console.log(`Unbanned user ${user.userId}`);
        }
      }
    } catch (error) {
      console.error('Error checking for unbans:', error);
    }
  };
  

module.exports = handleUnbans;
