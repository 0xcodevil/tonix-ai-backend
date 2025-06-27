const User = require("../models/user.model");
const JWT = require("../utils/jwt");

const loginUser = async (id, username, firstName, lastName, isPremium, isBot, photoUrl, inviterId) => {

  var user = await User.findOne({ 'telegram.id': id });

  if (user) {
    user.telegram = { id, username, firstName, lastName, isPremium, isBot, photoUrl };
    await user.save().then(() => console.log(`${firstName} logged in.`));
  } else {
    try {
      user = new User({ telegram: { id, username, firstName, lastName, isPremium, photoUrl, isBot } });
      await user.save();
      console.log(`${firstName} registered.`);

      if (inviterId && inviterId !== id) {
        const inviter = await User.findOne({ 'telegram.id': inviterId });
        if (inviter && !inviter.friends.includes(user._id)) {
          inviter.friends.push(user._id);
          await inviter.save();

          user.invitedBy = inviter._id;
          await user.save();
        }
      }
    } catch (err) {
      console.error(`Sign up failed: ${err.message}`);
    }
  }
}

const login = async (req, res) => {
  const data = req.body;
  const tokenDuration = 6 * 3600;

  await loginUser(data.id, data.username, data.first_name, data.last_name, data.is_premium, data.is_bot, data.photo_url, data.inviterId);

  const token = JWT.generate({ telegramId: data.id });
  res.cookie('access_token', token, { httpOnly: true, maxAge: tokenDuration * 1000 }).json({ msg: "OK" });
};

const logout = async (req, res) => {
  res.clearCookie('access_token').json({ message: "Logged out." });
};

module.exports = { login, logout, loginUser };