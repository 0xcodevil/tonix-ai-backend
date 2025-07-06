const express = require('express');
const router = express.Router();

const {
  generate,
  upload, uploadImage
} = require('../controllers/image.controller');

router.post('/generate', generate);
router.post('/upload', upload.single('file'), uploadImage);

module.exports = router;
