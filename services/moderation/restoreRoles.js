const mongoose = require('mongoose')
const Member = require('../../models/member')

mongoose.connect('mongodb+srv://discord:hx8xz7PVqOUVruby@demc-database.y2cemfb.mongodb.net/DEMC-DISCORD?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
  async restoreRoles(member) {
    // Find the backup document for this member
    const backup = await Member.findOne({
      userId: member.id,
      guildId: member.guild.id,
    });

    // Check if a backup was found
    if (backup) {
      // Restore the member's roles
      await member.roles.set(backup.roles).catch((error) => {
        console.log('Failed to backup roles of user: ' + member.user.username + ' ' + error);
      });
      
      console.log('Restore Roles Success: ' + member.user.username)
    }
  }
};
