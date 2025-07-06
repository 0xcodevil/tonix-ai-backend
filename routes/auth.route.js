const express = require('express');
const router = express.Router();

const { 
  loginWithGoogle,
  loginWithTelegram,
  logout,
} = require('../controllers/auth.controller');

router.post('/google', loginWithGoogle);
router.post('/telegram', loginWithTelegram);
router.post('/logout', logout);

module.exports = router;
