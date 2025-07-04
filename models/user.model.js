const mongoose = require('mongoose');

const TelegramUserSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    username: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    isBot: { type: Boolean, default: false },
    photoUrl: { type: String, default: '' },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    telegram: { type: TelegramUserSchema, required: true },
    coin: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
