const express = require('express');
const router = express.Router();

const {
  generate,
} = require('../controllers/image.controller');

router.post('/generate', generate);

module.exports = router;
