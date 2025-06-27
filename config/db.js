const mongoose = require('mongoose');

module.exports.connect = (url) => {
  return mongoose.connect(url).then(res => {
    console.log('DB connected.');
    return res;
  });
};
