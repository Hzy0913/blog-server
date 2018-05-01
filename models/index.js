const mongoose = require('mongoose');
const auth = require('./auth');
const article = require('./article');

mongoose.connect('mongodb://localhost:27017/blog')


const Models = Object.assign(
  auth,
  article
);

module.exports = Models;
