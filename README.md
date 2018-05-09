## 博客后台及文章管理系统

## 安装

```
git clone git@github.com:Hzy0913/blog-server.git
```
安装包依赖
```
npm install
```

## 运行
首先安装mongodb和redis后并启动
**启动服务命令**
```js
npm start
```
## 后台管理系统
在`admin`文件夹下是博客的后台管理
cd进入admin文件夹后安装依赖
```js
npm install
```
**运行项目**
```js
npm run dev
```
- `static`目录下有登录页面以及个人介绍页面
- `config`目录下为基本配置项，包括**端口**、**登录账号密码**、**校验toen的接口**、**加密盐**
- `blog-serverpull.js`文件为自动化git部署文件，具体使用可以看[这篇文章](http://binlive.cn/details/59917958b7f98169b30efa24 "这篇文章")
## 项目说明

 - 使用koa2作为后端服务
 - 使用token校验接口权限
 - 使用数据库使用mongodb，配置redis持久化存储session
 - 使用github的Oauth授权登录
 - 上传图片保存至七牛图床
 - 后台管理使用vue全家桶加iview 组件

## 在线预览
[博客](http://binlive.cn "博客")
## 博客前端代码
博客的前端项目为[ssr博客前端](https://github.com/Hzy0913/my-blog "ssr博客前端")
