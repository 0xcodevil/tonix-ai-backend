const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { v4: uuid } = require('uuid');
const multer = require('multer');
const download = require('download');
const { IMAGE_LIMIT_PER_DAY } = require('../config');
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

const getStatus = async (req, res) => {
  const now = new Date();

  const startOfToday = now;
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = now;
  endOfToday.setHours(23, 59, 59, 999);

  const count = await Image.countDocuments({
    user: req.user._id,
    createdAt: {
      $gte: startOfToday.getTime(),
      $lte: startOfToday.getTime(),
    }
  });

  return res.json({
    current: Math.max(IMAGE_LIMIT_PER_DAY - count, 0),
    limit: IMAGE_LIMIT_PER_DAY,
  });
}

const generate = async (req, res) => {
  const now = new Date();

  const startOfToday = now;
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = now;
  endOfToday.setHours(23, 59, 59, 999);

  const count = await Image.countDocuments({
    user: req.user._id,
    createdAt: {
      $gte: startOfToday.getTime(),
      $lte: startOfToday.getTime(),
    }
  });

  if (count >= IMAGE_LIMIT_PER_DAY) return res.status(500).json({ msg: 'Image generation limited for today.' });

  const { prompt, ratio } = req.body;
  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: ratio,
    });

    const images = [];
    for (let data of response.data) {
      const filename = uuid();
      await download(data.url).pipe(fs.createWriteStream(`uploads/${filename}.jpg`));
      const image = new Image({
        user: req.user._id,
        prompt: prompt,
        image: `/uploads/${filename}.jpg`,
      });

      await image.save();
      images.push(image);
    }

    return res.json({
      images: images.map(image => ({
        id: image._id,
        prompt: prompt,
        url: image.image
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
}

const editImages = async (req, res) => {
  const now = new Date();

  const startOfToday = now;
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = now;
  endOfToday.setHours(23, 59, 59, 999);

  const count = await Image.countDocuments({
    user: req.user._id,
    createdAt: {
      $gte: startOfToday.getTime(),
      $lte: startOfToday.getTime(),
    }
  });

  if (count >= IMAGE_LIMIT_PER_DAY) return res.status(500).json({ msg: 'Image generation limited for today.' });
  
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

    const images = [];
    for (let data of response.data) {
      const filename = uuid();
      await download(data.url).pipe(fs.createWriteStream(`uploads/${filename}.jpg`));
      const image = new Image({
        user: req.user._id,
        prompt: prompt,
        image: `/uploads/${filename}.jpg`,
      });

      await image.save();
      images.push(image);
    }

    return res.json({
      images: images.map(image => ({
        id: image._id,
        prompt: prompt,
        url: image.image
      }))
    });
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

const publishImage = async (req, res) => {
  const { id, isPublic } = req.body;
  const image = await Image.findById(id);
  if (!image) return res.status(400).json({ msg: 'Image not found.' });
  if (image.user.equals(req.user._id)) {
    image.isPublic = isPublic;
    await image.save();

    return res.json({ success: true });
  } else {
    return res.status(400).json({ msg: 'You don\'t have permission of this image.' });
  }
}

const getImages = async (req, res) => {
  const { page = 0, pageSize = 4 } = req.query;
  const images = await Image.find({ isPublic: true }).sort({ createdAt: -1 }).skip(page * pageSize).limit(pageSize).populate('user');
  const result = images.map(image => ({
    id: image._id,
    url: image.image,
    prompt: image.prompt,
    avatar: image.user.avatar,
    firstName: image.user.firstName,
    lastName: image.user.lastName,
  }));

  return res.json(result);
}

const getMyImages = async (req, res) => {
  const { page = 0, pageSize = 4 } = req.query;
  const images = await Image.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(page * pageSize).limit(pageSize).populate('user');
  const result = images.map(image => ({
    id: image._id,
    url: image.image,
    prompt: image.prompt,
    avatar: image.user.avatar,
    firstName: image.user.firstName,
    lastName: image.user.lastName,
    isPublic: image.isPublic,
  }));

  return res.json(result);
}

const deleteImage = async (req, res) => {
  const image = await Image.findById(req.body.id);
  if (!image) return res.status(400).json({ msg: 'Image not found' });
  if (req.user.isAdmin || req.user._id.equals(image.user)) {
    await Image.findByIdAndDelete(req.body.id);
    res.json({ success: true });
  } else {
    return res.status(400).json({ msg: 'You\'re not admin' });
  }
}

module.exports = {
  getStatus,
  generate,
  getImages,
  getMyImages,
  editImages,
  deleteImage,
  publishImage,
  upload, uploadImage
}