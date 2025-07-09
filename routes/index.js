const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

const authRouter = require('./auth.route');
const userRouter = require('./user.route');
const imageRouter = require('./image.route');

router.use('/auth', authRouter);
router.use('/user', authenticate, userRouter);
router.use('/image', imageRouter);

module.exports = router;