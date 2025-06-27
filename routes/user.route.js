const express = require('express');
const router = express.Router();

const {
    me,
} = require('../controllers/user.controller');

router.get('/me', me);

module.exports = router;
