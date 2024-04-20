const mongoose = require('mongoose');

const BanSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  banTimestamp: Date,
  reason: String,
});

module.exports = mongoose.model('Ban', BanSchema);
