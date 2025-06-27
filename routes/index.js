const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

const authRouter = require('./auth.route');
const userRouter = require('./user.route');

router.use('/auth', authRouter);
router.use('/user', authenticate, userRouter);

module.exports = router;