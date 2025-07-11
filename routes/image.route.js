const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

const {
  getImages,
  generate,
  editImages,
  deleteImage,
  upload, uploadImage,
} = require('../controllers/image.controller');

router.get('/list', getImages);
router.post('/generate', authenticate, generate);
router.post('/delete', authenticate, deleteImage);
router.post('/upload', authenticate, upload.single('image'), uploadImage);
router.post('/edit', authenticate, upload.single('image'), editImages);

module.exports = router;
