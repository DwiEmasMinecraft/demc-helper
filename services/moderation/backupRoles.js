const mongoose = require('mongoose')
const Member = require('../../models/member')

mongoose.connect('mongodb+srv://discord:hx8xz7PVqOUVruby@demc-database.y2cemfb.mongodb.net/DEMC-DISCORD?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
  async backupRoles(member) {
    // Find and update the existing backup document for this member
    await Member.findOneAndUpdate(
      { userId: member.id, guildId: member.guild.id },
      { 
        username: member.user.username,
        roles: member.roles.cache.map((role) => role.id) 
      },
      { upsert: true }
    ).catch((error) => {
      console.log('Failed to backup roles of user: ' + member.user.username + ' ' + error);
    });
    console.log('Backup Roles Success: ' + member.user.username)
  }
};

