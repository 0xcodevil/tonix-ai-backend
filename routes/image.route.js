const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

const {
  getImages,
  generate,
  editImages,
  upload, uploadImage,
} = require('../controllers/image.controller');

router.get('/list', getImages);
router.post('/generate', authenticate, generate);
router.post('/upload', authenticate, upload.single('image'), uploadImage);
router.post('/edit', authenticate, upload.single('image'), editImages);

module.exports = router;
