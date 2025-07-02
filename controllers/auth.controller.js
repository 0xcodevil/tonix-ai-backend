const User = require('../models/user.model');
const JWT = require('../utils/jwt');
const { AuthDataValidator } = require('@telegram-auth/server');

const validator = new AuthDataValidator({ botToken: process.env.BOT_TOKEN });

const login = async (req, res) => {
  console.log(req.query);
  try {
    const telegram = await validator.validate(new Map(Object.entries(req.query)));

    var user = await User.findOne({ 'telegram.id': telegram.id });

    if (user) {
      user.telegram = {
        id: telegram.id,
        username: telegram.username,
        firstName: telegram.first_name,
        lastName: telegram.last_name,
        isPremium: telegram.is_premium,
        isBot: telegram.is_bot,
        photoUrl: telegram.photo_url
      };
      await user.save().then(() => console.log(`${telegram.first_name} logged in.`));
    } else {
      user = new User({
        telegram: {
          id: telegram.id,
          username: telegram.username,
          firstName: telegram.first_name,
          lastName: telegram.last_name,
          isPremium: telegram.is_premium,
          isBot: telegram.is_bot,
          photoUrl: telegram.photo_url
        }
      });
      await user.save();
      console.log(`${telegram.first_name} registered.`);
    }

    const token = JWT.generate({ telegramId: telegram.id });
    res.cookie('access_token', token, { httpOnly: true }).redirect('/?login=success');
  } catch (err) {
    console.log(err.message);
    res.redirect('/?login=failed');
  }
};

const logout = async (req, res) => {
  res.clearCookie('access_token').json({ message: "Logged out." });
};

module.exports = { login, logout };