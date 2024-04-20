const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  username: String,
  userId: String,
  guildId: String,
  roles: Array,
});

module.exports = mongoose.model('Members', memberSchema);
