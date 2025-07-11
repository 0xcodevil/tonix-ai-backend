const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { v4: uuid } = require('uuid');
const multer = require('multer');
const download = require('download');
const Image = require('../models/image.model');

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + '.' + ext);
  }
});

const upload = multer({ storage });

const generate = async (req, res) => {
  const { prompt, ratio } = req.body;

  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: ratio,
    });

    for (let data of response.data) {
      const filename = uuid();
      await download(data.url).pipe(fs.createWriteStream(`uploads/${filename}.jpg`));
      const image = new Image({
        user: req.user._id,
        prompt: prompt,
        image: `/uploads/${filename}.jpg`,
      });

      await image.save();
    }

    return res.json({ images: response.data.map(d => d.url) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
}

const editImages = async (req, res) => {
  const { prompt, ratio } = req.body;

  const imageFile = 'uploads/' + req.file.filename;

  const image = await OpenAI.toFile(fs.createReadStream(imageFile), null, {
    type: "image/png",
  });

  try {
    const response = await client.images.edit({
      model: "dall-e-2",
      image: image,
      prompt: prompt,
      size: ratio,
      response_format: "url"
    });

    for (let data of response.data) {
      const filename = uuid();
      await download(data.url).pipe(fs.createWriteStream(`uploads/${filename}.jpg`));
      const image = new Image({
        user: req.user._id,
        prompt: prompt,
        image: `/uploads/${filename}.jpg`,
      });

      await image.save();
    }

    return res.json({ images: response.data.map(d => d.url) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
}

const uploadImage = async (req, res) => {

  const image = new Image({
    user: req.user._id,
    prompt: req.body.prompt,
    image: '/uploads/' + req.file.filename,
  });

  await image.save();

  res.json({ url: image.image });
}

const getImages = async (req, res) => {
  const images = await Image.find().limit(4).sort({ createdAt: -1 }).populate('user');
  const result = images.map(image => ({
    url: image.image,
    prompt: image.prompt,
    avatar: image.user.avatar,
    firstName: image.user.firstName,
    lastName: image.user.lastName,
  }));

  return res.json(result);
}

module.exports = {
  generate,
  getImages,
  editImages,
  upload, uploadImage
}