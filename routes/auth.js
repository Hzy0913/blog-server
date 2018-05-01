const router = require('koa-router')({})
const qn = require("qn");
const path = require("path");
const bytes = require('bytes');
const fs = require("fs")
const multer = require('koa-multer');
const db = require('../models'); //models

router.prefix('/auth');

router.get('/logined', async ctx => {
  const {id} = ctx.state;
  ctx.body = {statu: id ? 200 : 401};
});

router.post('/login', async ctx => {
  const {user: userName, pass} = ctx.request.body;
  if (!userName && !pass) {
    ctx.body = {err: 401, message: '账号密码未输入'};
    return;
  }
  const output = {
    name: 1,
    user: 1,
    passworld: 1,
  };
  await db.LiveUser.findOne({user: userName}, output, (err, docs) => {
    if (err) { ctx.body = {err: 504, message: '服务器错误'}; return; }
    if (!docs) { ctx.body = {err: 401, message: '账号或密码不正确'}; return; }
    if (docs.passworld !== pass) {
      ctx.body = {err: 401, message: '您输入的账号密码不正确'};
    } else {
      //jwt生成token
      const token = jwt.sign({
        id: docs._id
      }, secret, {
        expiresIn:  3600//秒到期时间
      });
      const {_id, name, user} = docs;
      const auth = {_id, name, user}
      ctx.body = {token, err: 200, auth, message: '登录成功'};
    }
  });
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
  } else {
    ctx.throw(300, {message: '该账号已被注册！'});
  }
});

//保存Tag
router.post('/saveArticleLabel', async ctx => {
  const {tagName, tagNumber} = ctx.request.body;
  const tagList = await db.TagList.find({});
  const isExist = tagList.find(item => item.tagName === tagName);
  if (isExist) {
    ctx.throw(502, {message: '该标签已存在！'});
  }
  await new db.TagList({tagName, tagNumber}).save();
  ctx.body = {err: 200, message: '标签保存成功'};
});

//查询Tag
router.get('/getArticleLabel', async ctx => {
  const tagList = await db.TagList.find({});
  ctx.body = {err: 200, tagList};
});

//删除Tag
router.post('/delectTag', async ctx => {
  const {tagName} = ctx.request.body;
  await db.TagList.remove({tagName});
  ctx.body = {err: 200, message: '标签删除成功'};
});

//保存文章
router.post('/saveArticle', async ctx => {
  const model = ctx.request.body.model;
  const {title, label} = model;
  model.tag = label[0];
  const sameTitle = await db.Article.findOne({title});
  if (sameTitle) {
    ctx.throw(402, {message: '该文章标题已存在！'});
  }
  const newArticle = await new db.Article(model).save();
  await db.TagList.update({tagName: label[0]}, {$inc : {tagNumber : 1}});
  ctx.body = {err: 200, message: '文章发布成功', newArticle};
});

//查询文章列表
router.get('/adminArticleList', async ctx => {
  const ArticleList = await db.Article.find({state: 'publish'}, {_id: 1, title: 1, label: 1, date: 1});
  ctx.body = {err: 200, ArticleList};
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

//修改文章
router.post('/updateArticle', async ctx => {
  const model = ctx.request.body.model;
  const {title, label, id, articleContent, introduce} = model;
  const sameTitle = await db.Article.findOne({_id: id});
  if (!sameTitle) {
    ctx.throw(402, {message: '该文章不存在，不能修改！'});
  }
  const newArticle = await db.Article.update({_id : id}, {$set : {title, label, articleContent, introduce}});
  ctx.body = {err: 200, message: '文章发布成功'};
});

//删除文章
router.post('/delectArticle', async ctx => {
  const {id} = ctx.request.body;
  await db.Article.remove({_id: id});
  ctx.body = {err: 200, message: '文章删除成功'};
});



// img上传
const storage = multer.memoryStorage();
const upload = multer({
  dest: 'uploads/',
  storage: storage,
  limits: {
    fileSize: bytes('5MB') // 限制文件在5MB以内
  }
});
router.post('/imgUpload', upload.single('image'), async ctx => {
  const client = qn.create({
    accessKey: 'W712xA97i9sl2112gg5ZpBB12P8gXTL42R1tqNUzWdBT15imw', //七牛accessKey
    secretKey: '1Z0_UAf9wvn1yBZmZgLsv-OXD4cNfzn07T8CLJRC', //七牛secretKey
    bucket: 'binliveimg',
    origin: 'http://img.binlive.cn/',
    timeout: 3600000,
    uploadURL: 'http://up-z1.qiniu.com',
  });
  const {buffer, originalname} = ctx.req.file;
  return new Promise((resolve, reject) => {
    client.upload(buffer, {key: `/upload/${new Date().getTime()}${originalname}`}, (err, result) => {
      if (err) {
        ctx.throw(502, {message: '上传失败！'});
        reject(err)
      } else {
        ctx.body = {
          err: 200,
          data: result.url
        }
        resolve();
      }
    })
  })

});


module.exports = router;
