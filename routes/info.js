const router = require('koa-router')({})
const db = require('../models'); //models
const jwt = require('jsonwebtoken');
const axios = require('axios');
const {admin, secret} = require('../config')

router.prefix('/api');


// 查询博客标签
router.get('/getArticleLabel', async (ctx, next) => {
  const tagList =  await db.TagList.find({});
  ctx.body = {err: 200, tagList};
});

// 查询文章分页
const pageSize = 10;
router.get('/articleList/:page', async (ctx, next) => {
  const {page} = ctx.params;
  const Articles = await db.Article.find({state: "publish"}, {articleContent: 0, comment: 0}).sort({date: -1}).skip(page * pageSize).limit(pageSize);
  ctx.body = {err: 200, Articles};
});

// 查询文章详情
router.get('/articleDetails/:id', async ctx => {
  const {id} = ctx.params;
  const articleDetails = await db.Article.findOne({_id: id});
  if (!articleDetails) {
    ctx.throw(402, {message: '该文章不存在'});
  }
  ctx.body = {err: 200, articleDetails};
});

// 文章标签查询分页
router.get('/getArticleLabel/:labe/:page', async ctx => {
  const {labe, page} = ctx.params;
  const Article = await db.Article.find({tag: labe}, {articleContent: 0, comment: 0}).sort({date: -1}).skip(page * pageSize).limit(pageSize);
  ctx.body = {err: 200, Article};
});

// 文章模糊查询
router.get('/ArticleSearch/:search', async ctx => {
  const {search} = ctx.params;
  if (!search) {
    ctx.body = {err: 200, Article: []};
    return;
  }
  const Article = await db.Article.find({title:{$regex: search, $options:'i'}});
  ctx.body = {err: 200, Article};
});


router.get('/getuser', async (ctx, next) => {
  const output = {
    name: 1,
    user: 1,
  };
  const userList = await db.LiveUser.find({}, output);
  ctx.body = {err: 200, userList};
});

router.post('/register', async ctx => {
  const {user, pass} = ctx.request.body;
  if (!user && !pass) { ctx.body = {err: 401, message: '未输入注册账号密码'}; return; }
  const hasUser = await db.LiveUser.findOne({user});
  if (!hasUser) {
    const userobj = {
      user,
      passworld: pass,
    };
    const save = await new db.LiveUser(userobj).save();
    ctx.body = {err: 200, message: '注册成功'};
  }
});

//生成验证码
var textArr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
router.get('/getVerif', async ctx => {
  const Verification = [];
  [1, 1, 1, 1].forEach(item => {
    Verification.push(textArr[randomNum(0, textArr.length)]);
  })
  ctx.session.Verifcode = Verification;
  ctx.body = {err: 200, Verifcode: Verification};
});

// 比对验证码
router.post('/checkcode', async ctx => {
  const {code} = ctx.request.body;
  const {Verifcode} = ctx.session;
  let sessionCode = '';
  Verifcode.forEach(item => {
    sessionCode += item;
  })
  if (code.toLowerCase() === sessionCode.toLowerCase()) {
    ctx.body = {err: 200, message: '验证成功'};
  } else {
    ctx.body = {err: 405, message: '验证码输入不正确！'};
  }
});

// login
router.post('/login', async ctx => {
  const {user, pass} = ctx.request.body;
  if (user === admin.user && pass === admin.pass) {
    const token = jwt.sign({id: 'admin'}, secret, {expiresIn:  2000000});
    ctx.body = {err: 200, message: '登录成功！', token};
  } else {
    ctx.body = {err: 403, message: '账号或密码错误！'};
  }
});

// comment
router.post('/comment/:id', async ctx => {
  const {id} = ctx.params;
  const {user} = ctx.request.body;
  await db.Article.update({_id : id}, {$push : {comment: user}});
  ctx.body = {err: 200, message: '评论成功！'};
});
// subComment
router.post('/subComment/:id/:subid', async ctx => {
  const {id, subid} = ctx.params;
  const {user} = ctx.request.body;
  const {comment} = await db.Article.findOne({_id : id});
  let index = 0;
  comment.forEach(async (item, i) => {
    if (item.created == subid) {
      index = i;
    }
  });
  const key = `comment.${index}.subcomment`;
  await db.Article.update({_id : id}, {$push: {[key]: user}});
  ctx.body = {err: 200, message: '评论成功！'};
});

// auth
router.post('/auth', async ctx => {
  const {lid} = ctx.request.body;
  const jwtVerify = await jwt.verify(lid, secret);
  if (jwtVerify.id === 'admin') {
    ctx.body = {err: 200, message: '登录成功！'};
  } else {
    ctx.body = {err: 401, message: '登录已过期！'};
  }
});

// github Oauth
router.get('/oauth', async ctx => {
  const {code, state} = ctx.query;
  const {data} = await axios.get(`https://github.com/login/oauth/access_token?client_id=ee9b0123554324f149bf&client_secret=98165fd8123123f58b5912312e6fb67995c54b&code=${code}&redirect_uri=http://www.binlive.cn:3080/api/oauth`);
  const access_token = data.split('&')[0].split('=')[1];
  const {data: userInfo} = await axios.get(`https://api.github.com/user?access_token=${access_token}`);
  const {id, name, avatar_url, email, html_url, created} = userInfo;
  const user = await db.OAUTH.findOne({id});
  if (!user) {
    await new db.OAUTH({id, name, avatar_url, email, html_url, created}).save();
  }
  ctx.status = 301;
  ctx.redirect(`http://binlive.cn/details/${state}?id=${userInfo.id}`);
});

// github auth
router.get('/authorized/:id', async ctx => {
  const {id} = ctx.params;
  if(id) {
    const user = await db.OAUTH.findOne({id});
    ctx.body = {err: 200, user};
  } else {
    ctx.body = {err: 200, user: ''};
  }
});

module.exports = router;
