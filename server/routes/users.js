const router = require('koa-router')()
const mongoose= require('mongoose');
const user = require('../models/login');
const path = require('path')
const Passport = require('../config/passport')

const fs = require('fs')
const session = require('koa-generic-session')
const redis = require('koa-redis')
const nodeMailer =require('nodemailer')
const Email = require('../config/config')
const crypot = require('../config/Crypot')
router.prefix('/users')

//连接数据库 地址+数据库名
mongoose.connect('mongodb://127.0.0.1:27017/books');

mongoose.connection.on("connected",function () {
    console.log("connected success")
});
mongoose.connection.on("error",function () {
    console.log("connected err")
});
mongoose.connection.on("disconnected",function () {
    console.log("connected dis")
});

let Store = new redis().client

//注册
router.post('/register', async (ctx,next) => {
    let {username,pas,code,email} = ctx.request.body
    //redis中取数据
    // let nodeCode = await Store.hget(`nodemail:${username}`,'code');
    // let expire = await Store.hget(`nodemail:${username}`,'expire')
    console.log('111111')
    //判断code是否正确
    // if(code){
    //      if(nodeCode===code){
    //         //过期没有
    //         if(new Date().getTime()-expire>0){
    //             ctx.body={
    //                 statu:1,
    //                 msg:'验证码已过期'
    //             }
    //             return false;
    //         }
    //         //验证成功删除keys
    //         let del = await Store.del(`nodemail:${username}`)
    //      } else{
    //         ctx.body={
    //         statu:1,
    //         msg:'请输入正确的验证码'
    //        }
    //        return false;
    //      }
    // }else{
    //     ctx.body={
    //         statu:1,
    //         msg:'请输入验证码'
    //     }
    //     return false;
    // }
    try{
        let nuser = new user({
            username,
            pas
            // email
        })
        let result = await nuser.save();
        if (result){
            ctx.body={
                statu:0,
                msg:'注册成功'
            }
        } else{
            ctx.body={
                statu:1,
                msg:'注册失败'
            }
        }
    }catch (e) {
        ctx.body = {
            statu:1,
            msg:'注册失败，请稍后再试'
        }
        console.log(e)
    }
    next()
})
    //发送验证ma
    // .post('/verify',async (ctx,next)=>{
    //        let username = ctx.request.body.username;
    //        //先获取这个用户是否在一分钟内多次请求
    //       const saveExpire= await Store.hget(`nodemail:${username}`,'expire')
    //     if(saveExpire && new Date().getTime()+60*1000*4-saveExpire < 0){
    //         ctx.body={
    //             statu:1,
    //             msg:'验证过于频繁,一分钟内一次'
    //         }
    //         return false;
    //     }
    //     //配置邮件服务
    //     let transporter = nodeMailer.createTransport({
    //         host:'smtp.qq.com',
    //         port:465,
    //         secureConnection:true,
    //         auth:{
    //             user:Email.smtp.user(),
    //             pass:Email.smtp.pass()
    //         }
    //     })
    //     //配置发送对象
    //     let ko = {
    //         code:Email.smtp.code(),
    //         expire:Email.smtp.expire(),
    //         email:ctx.request.body.email,
    //         user:ctx.request.body.username
    //     }
    //     let mailOptions = {
    //         from:Email.smtp.user(),
    //         to:ko.email,
    //         subject:'《二手书》',
    //         html:`你的注册码是:<h1>${ko.code}</h1>,有效期为5分钟`
    //     }
    //     await transporter.sendMail(mailOptions,(err,info)=>{
    //         console.log('服务器出现错误,稍后再试')
    //         if (err){
    //             ctx.body={
    //                 statu:1,
    //                 msg:'服务器出现错误,稍后再试'
    //             }

    //             console.log(err,'服务器出现错误,稍后再试')
    //             return false;
    //         }else{
    //             Store.hmset(`nodemail:${ko.user}`,'code',ko.code,'expire',ko.expire,'email',ko.email)
    //         }
    //     })
    //    ctx.body={
    //         statu:0,
    //         msg:'验证码已发送,可能会有延时'
    //    }


    // })
//登录
.post('/signin', async (ctx, next) => {
    var user = ctx.request.body;
  return Passport.authenticate('local', function(err, user, info, status) {
    if (err) {
      ctx.body = {
        statu: 1,
        msg: err
      }
    } else {
        if (user) {
            ctx.body = {
                statu: 0,
                msg: '登录成功',
                user
            }
            // console.log('ctx',ctx,'222',user.username)
        // return ctx.login(user)
        ctx.cookies.set("name",user.username,{maxAge:60*60*1000})

        return ctx.body
      } else {
        ctx.body = {
          statu: 1,
          msg: info
        }
      }
    }
  })(ctx, next)
})
//登出
.post('/loginOut',async(ctx,next)=>{
       await ctx.logout()
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      statu: 0
    }
  } else {
    ctx.body = {
      statu: 1
    }
  }
})
//上传头像
    .post('/upHeadImg',async (ctx,next)=>{
        if(ctx.cookies.get("name")){
            let headImg = ctx.request.body.headImg;
            let username = ctx.request.body.username
            //正则去除文件信息
            var base64Data = headImg.replace(/^data:image\/\w+;base64,/, '')
            var dataBuffer = Buffer.from(base64Data,'base64')
            // 设置文件名
            var imgName = username+'.png';
            await fs.writeFile('./public/imgs/'+imgName,dataBuffer,function (err) {
                if (err) {
                    console.log(err);
                    ctx.body={
                        statu:1,
                        msg:'上传失败,请稍后再试'
                    }
                };
            });
            var addImg = '/imgs/'+imgName
            try{
                let query = await user.updateOne({username},{$set:{headImg:addImg}})
                ctx.body={
                    statu:0,
                    msg:'上传成功'
                }
            }catch (e) {
                if (e) {
                    console.log('1',e);
                    ctx.body={
                        statu:1,
                        msg:'上传失败'
                    }
                }
            }
            next()
        }else{
            ctx.body={ statu:-1,msg:'请先登录过期，请先登录'}
        }

    })
    //获取头像
    .get('/getHeadImg',async (ctx,next)=>{
        if(ctx.cookies.get("name")){
            let username = ctx.request.query.username;
            var imgName = username+'.png';
            await user.findOne({username},function (err,doc) {
                console.log('getHeadImg',err,doc)
                if (err){
                    // console.log('getHeadImg',err)
                    ctx.body={
                        statu:1,
                        msg:err
                    }
                    return false;
                }
                if("headImg" in doc){
                    ctx.body = {
                        statu :0,
                        msg:{
                            headImg: doc.headImg
                        }
                    }
                } else{
                    ctx.body={
                        statu:1,
                        msg:'N'
                    }
                }
            })

        }else{
            ctx.body={ statu:-1,msg:'请先登录过期，请先登录'}
        }
        next()
    })
    .post('/getChat', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let { username, code,postName} = ctx.request.body
            //redis中取数据
            console.log('postName',postName)
            await user.findOne({username:postName},async (err,doc)=>{
                if (err){
                    console.log(err)
                    ctx.body={
                        statu:1,
                        msg:'服务器出现错误,稍后再试',
                    }
                }
                ctx.body={
                    doc
                }
             })
            // let nodeCode = await Store.hget(`node:${username}`, 'code');
            // let expire = await Store.hget(`node:${username}`, 'expire')
            //判断code是否正确
            // if (code) {
            //     if (nodeCode === code) {
            //         //过期没有
            //         if (new Date().getTime() - expire > 0) {
            //             ctx.body = {
            //                 statu: 1,
            //                 msg: '验证码已过期'
            //             }
            //             return false;
            //         }
            //         //验证成功删除keys
            //         let del = await Store.del(`node:${username}`)
            //         let res = await user.findOne({username:postName})

            //         ctx.body = {
            //             statu: 0,
            //             msg: '成功',
            //             res:crypot.Encrypt(res.wechat)
            //         }
            //     } else {
            //         ctx.body = {
            //             statu: 1,
            //             msg: '请输入正确的验证码'
            //         }
            //         return false;
            //     }
            // } else {
            //     ctx.body = {
            //         statu: 1,
            //         msg: '请输入验证码'
            //     }
            //     return false;
            // }
        } else {
            ctx.body = {
                statu: -1,
                msg: '请先登录在进行操作'
            }
        }

    })
    //检查手机号
    .post('/checkTel',async (ctx,next)=>{
          let tel = ctx.request.body.tel;
        let username = ctx.request.body.username;
        await user.find({tel},(err,doc)=>{
           // 大于0表示已经有人使用过改手机号
            if(err){
                ctx.body={
                    statu:1,
                    msg:'服务器出现错误,稍后再试'
                }
                console.log(err)
                return false;
            }
           if(doc.length !==0){
                ctx.body={
                    meg:'失败'
                }
                return false;
           }
        });
           //数据库中没有该手机号则添加
             try{
                let data = await user.update({username},{$set:{tel}});
                 ctx.body={
                     statu:0,
                     meg:'成功'
                 }
             }catch (e) {
                 console.log(e)
                 ctx.body={
                     statu:1,
                     msg:'更新失败'
                 }
             }

        next()
    })
    .post('/changePas',async (ctx,next)=>{
        let username = ctx.request.body.username;
        let newpas = ctx.request.body.password;
         try {
             let data =await user.update({username},{$set:{pas:newpas}})
             ctx.body={
                 statu:0,
                 msg:'更新成功'
             }
         }catch (e) {
             ctx.body={
                 statu:1,
                 msg:'更新失败'
             }
         }

         next()
    })
    .post('/checkWechat',async (ctx,next)=>{
        let username = ctx.request.body.username;
        let wechat = ctx.request.body.wechat;
        await user.find({wechat},(err,doc)=>{
            if (doc.length!==0){
                    ctx.body={
                        statu:1,
                        meg:'该wx已被人占用'
                    }
                    return;
            }
        })
            try {
                let data = await user.update({username},{$set:{wechat}})
                //console.log(data)
                ctx.body={
                    statu:0,
                    msg:'更新成功'
                }
            }catch (e) {
                ctx.body={
                    statu:1,
                    msg:'更新失败'
                }
            }
    })
    .post('/checkUsername',async (ctx,next)=>{
        let username = ctx.request.body.user
        await user.findOne({username},(err,doc)=>{
            if (err){
                ctx.body={statu:-1,msg:'请稍后再试'}
            }
            if (doc){
                ctx.body={statu:1,msg:'该用户名已被注册'}
            } else{
                ctx.body={statu:0,msg:'该用户名可用'}
            }
        })
    })
    .post('/checkEmail',async (ctx,next)=>{
        let email = ctx.request.body.email
        await user.findOne({email},(err,doc)=>{
            if (err){
                ctx.body={statu:-1,msg:'请稍后再试'}
            }
            if (doc){
                ctx.body={statu:1,msg:'该邮箱已被注册'}
            } else{
                ctx.body={statu:0,msg:'该邮箱可用'}
            }
        })
    })
    .post('/findWx',async (ctx,next)=>{
        let username = ctx.request.body.username

        await user.find({username},(err,doc)=>{
            if (err){
                ctx.body={statu:-1,msg:'请稍后再试'}
            }
            if (doc.hasOwnProperty("wechat")){
                ctx.body={statu:1,msg:'N'}
            } else{
                ctx.body={statu:0,msg:'Y'}
            }
        })
    })
    .post('/getInfoWx',async (ctx,next)=>{
        if(ctx.cookies.get('name')){
            let username = ctx.request.body.username;
            await user.findOne({username},function (err,doc) {
                if (err){
                    console.log(err)
                    ctx.body={
                        statu:1,
                        msg:err
                    }
                    return false;
                }
                if(doc.wechat===undefined||doc.wechat===null||doc===null){
                    ctx.body={
                        statu:1,
                        msg:'N'
                    }
                } else{
                    ctx.body = {
                        statu :0,
                        msg:{
                            Wechat:crypot.Encrypt(doc.wechat)
                        }
                    }
                }
            })

        }else{
            ctx.body={ statu:-1,msg:'请先登录过期，请先登录'}
        }
        next()
    })
    .post('/getInfoTel',async (ctx,next)=>{
        if(ctx.cookies.get(name)){
            let username = ctx.request.body.username;
            await user.findOne({username},function (err,doc) {
                if (err){
                    console.log(err)
                    ctx.body={
                        statu:1,
                        msg:err
                    }
                    return false;
                }
                if(doc.tel===undefined||doc.tel===null||doc===null){
                    ctx.body={
                        statu:1,
                        msg:'N'
                    }
                } else{
                    ctx.body = {
                        statu :0,
                        msg:{
                            tel:crypot.Encrypt(doc.tel),
                        }
                    }
                }
            })

        }else{
            ctx.body={ statu:-1,msg:'请先登录过期，请先登录'}
        }
        next()
    })




module.exports = router;
