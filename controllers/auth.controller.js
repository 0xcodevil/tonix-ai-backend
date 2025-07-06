const User = require('../models/user.model');
const JWT = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');
const { AuthDataValidator } = require('@telegram-auth/server');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const validator = new AuthDataValidator({ botToken: process.env.BOT_TOKEN });

const loginWithGoogle = async (req, res) => {
  const { clientId, credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    var user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        avatar: payload.picture,
      });
      await user.save();
    }

    const token = JWT.generate({ id: user._id });
    res.cookie('access_token', token, { httpOnly: true }).json({ success: true });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

const loginWithTelegram = async (req, res) => {
  try {
    const telegram = await validator.validate(new Map(Object.entries(req.body)));

    var user = await User.findOne({ telegramId: telegram.id });

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

module.exports = { loginWithGoogle, loginWithTelegram, logout };