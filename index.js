require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require("cookie-parser");

const DB = require('./config/db');
const router = require('./routes');

const Server = express();

Server.use(express.json());
Server.use(cookieParser());
Server.use(express.urlencoded({ extended: true }));
Server.use('/api/v1', router);

Server.use(express.static('../client/dist'));
Server.use('/uploads', express.static('uploads'));
Server.get('*', (_, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../client/dist') });
});

const port = process.env.PORT || 6002;
const start = async () => {
  try {
    await DB.connect(process.env.MONGO_URL);
    Server.listen(port, () => console.info(`Server is listening on port ${port}...`));
  } catch (error) {
    console.error(error);
  }
};

start();
