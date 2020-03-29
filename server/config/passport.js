const passport = require('koa-passport')
const LocalStrategy = require('passport-local')
const user = require('../models/login');


passport.use(new LocalStrategy(async function(username,password,done){
       
       let result = await user.findOne({username})
       if(result){
              if(result.pas===password){
              	return done(null,result);
              }else{
              	return done(null,false,'密码错误')
              }
       }else{
       	  return done(null,false,'用户不存在')
       }
}))

//使用passport来进行加密
passport.serializeUser(function(user,done){
        done(null,user);
})

//解密
passport.deserializeUser(function(user,done){
	    return done(null,user)
})

// export default passport;
module.exports = passport;