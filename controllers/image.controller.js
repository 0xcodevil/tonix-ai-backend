const OpenAI = require('openai');
const Image = require('../models/image.model');

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY
});

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
      const image = new Image({
        telegramId: '7716288560',
        prompt: prompt,
        ratio: ratio,
        image: data.url
      });

      await image.save();
    }

    return res.json({ images: response.data.map(d => d.url) });
  } catch (err) {
    return res.json({ msg: err.message });
  }
}

module.exports = {
  generate,
}