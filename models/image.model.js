const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true },
    prompt: { type: String, required: true },
    ratio: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;
