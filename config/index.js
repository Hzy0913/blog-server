const secret = 'yoursecret'; //加密的时候混淆
const port = 3080; //端口
const admin = {
  user: 'admin',
  pass: 'ab2a3ab21f20333661afdc536c57a163'
}; //admin
const superAdmin = '5ae1f2b29dfa9a8c31243124'; // 填写授权GitHub后要设置超级管理员的_id,用做前台删除评论
const verifyPath = ['/auth/logined', '/auth/logout', /^\/auth/]; // 验证token路径
module.exports = {secret, port, verifyPath, admin, superAdmin};
