const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const Redis = require('koa-redis')
const passport  = require('./config/passport')
const config  = require('./config/config');
const path = require('path')
const index = require('./routes/index')
const users = require('./routes/users')
const goods = require('./routes/goods')
// error handler
onerror(app)
const cors = require('koa2-cors')
app.use(cors({
    credentials: true,    // 允许读取cookie
    origin: 'http://127.0.0.1:3000'   // 此处填写前端跨域后被转译的地址
}))
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text'],
    formLimit:'3mb',
    textLimit:'3mb',
    jsonLimit:'7mb'
}))
app.use(json())
app.use(logger())
//暴露public下的资源
app.use(require('koa-static')(path.join(__dirname + '/public')))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


//// 通过任意字符串为基准进行加密算法的字符串
 app.keys = ['keyskeys','keys'];
//session 配置
app.use(session({
	store:new Redis(),
	key:'xianyuba',
	prefix:'xianyu'
}))
app.use(passport.initialize())
app.use(passport.session())

// routes
//向外暴露public目录下的资源
// app.use(require('koa-static')(path.resolve('./public')))
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(goods.routes(),goods.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
