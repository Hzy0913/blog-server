const mongoose = require('mongoose');

const {Schema} = mongoose;

//  用户对象模型
const userSchema = new Schema({
  name: {
    type: String,
    default: Date.now
  },
  avatar: String,
  user: String, //绑定邮箱
  passworld: String, //密码
  hash: String, //签名
  score: Number, //积分
  isregister: Boolean, //是否注册成功
});


//  Oauth对象模型
const oauthSchema = new Schema({
  id: Number,
  name: String,
  avatar_url: String,
  email: String,
  html_url: String,
  created: {
    type: String,
    default: Date.now
  },
});

const auth = {
  LiveUser: mongoose.model('LiveUser', userSchema),
  OAUTH: mongoose.model('OAUTH', oauthSchema),
};
module.exports = auth;
