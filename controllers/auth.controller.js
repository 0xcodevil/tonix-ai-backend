const User = require('../models/user.model');
const JWT = require('../utils/jwt');
const { AuthDataValidator } = require('@telegram-auth/server');

const validator = new AuthDataValidator({ botToken: process.env.BOT_TOKEN });

const loginWithTelegram = async (req, res) => {
  try {
    const telegram = await validator.validate(new Map(Object.entries(req.body)));

    var user = await User.findOne({ 'telegramId': telegram.id });

    if (!user) {
      user = new User({
        telegramId: telegram.id,
        firstName: telegram.first_name,
        lastName: telegram.last_name,
        avatar: telegram.photo_url,
      });
      await user.save();
    }

    const token = JWT.generate({ id: user._id });
    res.cookie('access_token', token, { httpOnly: true }).json({ success: true });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie('access_token').json({ message: "Logged out." });
};

module.exports = { loginWithTelegram, logout };