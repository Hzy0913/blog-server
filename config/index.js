const secret = 'hzy0913secret'; //加密的时候混淆
const port = 3080; //端口
const admin = {
  user: 'admin',
  pass: 'ab2a3ab21f20333661afdc536c57a163'
}; //admin
const verifyPath = ['/auth/logined', '/auth/logout', /^\/auth/]; // 验证token路径
module.exports = {secret, port, verifyPath, admin};
