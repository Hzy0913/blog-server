const mongoose = require('mongoose');
const {Schema} = mongoose;

const articleSchema = new Schema({
  title: String,
  date: Date,
  articleContent: String,
  state: String,
  label: Array,
  tag: String,
  user: Array,
  comment: Array,
  introduce: String,
})

const tagSchema = new Schema({
  tagName: String,
  tagNumber: Number
})

const article = {
  Article: mongoose.model('Article', articleSchema),
  TagList: mongoose.model('TagList', tagSchema),
};

module.exports = article;

