const express = require('express');
const router = express.Router();

const { 
  loginWithGoogle,
  loginWithTelegram,
} = require('../controllers/auth.controller');

router.post('/google', loginWithGoogle);
router.post('/telegram', loginWithTelegram);

module.exports = router;
