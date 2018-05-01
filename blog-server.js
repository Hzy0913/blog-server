const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')()
const fs = require("fs")
const path = require('path')
const json = require('koa-json')
const jwt = require('jsonwebtoken')
const logger = require('koa-logger')
const cors = require('kcors')
const bodyparser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const {secret, port, verifyPath} = require('./config')

app.use(bodyparser({enableTypes: ['json', 'form', 'text']}))
app.use(cors())
app.use(json())
app.use(logger())


// session 模块
app.keys = [secret];
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 1000,
    overwrite: true,
    signed: true
  },
  store: redisStore({})
}));

app.use(koaStatic(path.join( __dirname,  './static')));
app.use(koaStatic(path.join( __dirname,  './admin/dist')));


app.use(async (ctx, next) => {
  await next().catch((err) => {
    if (err.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message
      };
    } else {
      ctx.status = err.status || 500;
      ctx.body = {error: err.originalError ? err.originalError.message : err.message};
    }
  });
});

app.use(async (ctx, next) => {
  const {URL: {pathname}, headers: {lid}} = ctx.request;
  const isVerify = verifyPath.some(item => {
    if (typeof item === 'string') {
      return item === pathname;
    } else if (typeof item === 'object'){
      return !!pathname.match(item)
    }
    return false;
  });
  if (isVerify) {
    let jwtVerify = {};
    try {
      jwtVerify = await jwt.verify(lid, secret);
    } catch (err) {
      ctx.throw(401, 'JsonWebTokenError', {name: 'JsonWebTokenError'});
    }
    const {id = ''} = jwtVerify;
    if (id) {
      ctx.state = {id}
    }
    await next();
  } else {
    await next();
  }
});


app.use(require('./routes/auth').routes());
app.use(require('./routes/info').routes());

router.get('/my', ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./static/my.html');
});
router.get('/admin', ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./static/login.html');
});

app.use(router.routes()).use(router.allowedMethods());

router.get('*', ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./admin/dist/index.html');
});

// 监听端口启动服务
app.listen(process.env.PORT || port, () => {
  console.log(`应用实例，访问地址为 localhost:${port}`);
});
