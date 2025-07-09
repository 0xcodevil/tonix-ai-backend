const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    prompt: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;
