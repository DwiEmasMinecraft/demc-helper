const mongoose = require('mongoose');

const tempBanSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  banTimestamp: Date,
  unbanTimestamp: Date,
  reason: String,
  wasUnbanned: { type: Boolean, default: false },
});

module.exports = mongoose.model('TempBan', tempBanSchema);
