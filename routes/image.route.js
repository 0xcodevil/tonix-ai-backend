const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

const {
  getImages,
  generate,
  upload, uploadImage,
} = require('../controllers/image.controller');

router.get('/list', getImages);
router.post('/generate', authenticate, generate);
router.post('/upload', authenticate, upload.single('file'), uploadImage);

module.exports = router;
