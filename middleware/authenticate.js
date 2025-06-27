const { StatusCodes } = require("http-status-codes");
const JWT = require('../utils/jwt');
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    console.log('Auth: Token is not provided.');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'You are not looged in.'});
  }

  const result = JWT.verify(token);
  if (!result.success) {
    console.log(result.error.message);
    console.log('Auth: Invalid token.');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token.' });
  }

  const user = await User.findOne({ 'telegram.id': result.payload.telegramId });
  if (!user) {
    console.log('Auth: User not found.');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found.'});
  }

  req.user = user;
  next();
}