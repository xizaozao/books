const router = require('koa-router')()
const mongoose = require('mongoose')
const user = require('../models/login')
const good = require('../models/goods')
const type = require('../models/classify')
const category = require('../models/category')
const Passport = require('../config/passport')
const path = require('path')
const fs = require('fs')
const redis = require('koa-redis')
const nodeMailer = require('nodemailer')
const Email = require('../config/config')
const crypot = require('../config/Crypot')
const Axios = require('axios')
router.prefix('/goods')

let Store = new redis().client
//上传商品信息
router.post('/upGoods', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let { username, goodsImg, goodsName, goodsPrice, goodsNum, goodsdetails, goodsTime, goodsNew, goodsclassify, goodsType } = ctx.request.body
            //看是否有这个关键字 没有就push
            let c = []
            let imgss
            let yyyy=0
            await user.findOne({username},(err,doc)=>{
                if (err){
                    console.log(err)
                    ctx.body={
                        statu:1,
                        msg:'服务器出现错误'
                    }
                }
                if (doc.wechat===undefined) {
                    ctx.body={
                        statu:1,
                        msg:'请先在设置中完善个人信息'
                    }
                    yyyy=1
                }
            })
            if (yyyy===0){
                await type.findOne({ goodsclassify }, (err, doc) => {
                    if (doc) {
                        let i = doc.childrens.find(function(value) {
                            return value === goodsType
                        })
                        if (typeof(i) == 'undefined') {
                            doc.childrens.push(goodsType)
                            try {
                                let y = doc.save()
                            } catch (e6) {
                                console.log(e6)
                            }
                        }
                    }

                })
                //自动生成0-1000的随机数41
                let goodsId = Date.now() + Math.floor(Math.random() * 1000);
                //图片张数
                let imgNum = goodsImg.length;
                let imgadd = ''
                let imgs = [];
                //保存图片
                for (i = 0; i < goodsImg.length;) {
                    let base64Data = goodsImg[i].replace(/^data:image\/\w+;base64,/, '')
                    let dataBuffer = Buffer.from(base64Data, 'base64')
                    //随机字符串
                    var str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
                    //字符串长高度
                    var leng = 48;
                    var stred = 'aab'
                    for (let i = 0; i < 12; i++) {
                        stred += str.charAt(Math.floor(Math.random() * leng));
                    }
                    //文件名
                    var imgName = goodsId + stred + i + '.png';
                    imgs.push(imgName)
                    await fs.writeFile('./public/goodsimg/' + imgName, dataBuffer, function(err) {
                        if (err) {
                            ctx.body={
                                statu:1,
                                msg:'服务器出现错误'
                            }
                        }
                    })
                    i++
                }
                imgss = imgs.join(',')
                //插入数据
                try {
                    let goods = new good({
                        username: username,
                        goodsId: goodsId,
                        imgNum: imgNum,
                        imgadd: imgss,
                        goodsName: goodsName,
                        goodsPrice: goodsPrice,
                        goodsDetails: goodsdetails,
                        goodsNum: goodsNum,
                        goodsTime: goodsTime,
                        goodsNew: goodsNew,
                        goodsType: goodsclassify + goodsType,
                    })
                    let data = await goods.save()
                    if (data != '') ctx.body = { statu: 0, msg: '发布成功' }
                } catch (e) {
                    console.log(e)
                    ctx.body = { statu: 1, msg: '发布失败' }
                    throw e;
                }
                next()
            }
        }else {
                ctx.body = {
                    statu: -1,
                    msg: '登录已过期，请重新登录'
                }
            }



    })
    .get('/used/getGoods', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let username = ctx.request.query.username

            try {
                await good.find({ username }, (err, doc) => {
                    // console.log(doc)
                    if (doc.length === 0) {
                        ctx.body = { statu: 1, msg: '还没有闲置商品' }
                        return;
                    }
                    ctx.body = {
                        statu: 0,
                        msg: '查询成功',
                        res: doc
                    }
                })
            } catch (e) {
                console.log(e)
                ctx.body = {
                    statu: 1,
                    msg: '出错了'
                }
                throw e
            }
        } else {
            ctx.body = { statu: -1, msg: '请登录' }
        }

    })
    //最近个更新的商品
    .get('/productionsNewest', async (ctx, next) => {
        let page = ctx.request.query.page
        //查全部商品
        let num = 6 //每页数量
        let start = (page - 1) * num //从哪里开始
        try {
            let query = await good.find({}).sort({ 'createTime': -1 }).skip(start).limit(num).exec()
            ctx.body = { status: 0, msg: query}
        } catch (e) {
            console.log(e)
            ctx.body = { status: 1, msg: e }
        }

        next();
    })
    .get('/goodsInfo', async (ctx, next) => {
        //获取id
        let goodsId = ctx.request.query.id;
        try {
            let query = await good.find({ goodsId })
            ctx.body = { status: 0, msg: query }
        } catch (e) {
            console.log(e)
        }

    })
    .post('/addCar', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let { username, goodsId, goodsName, goodsPrice, count, goodsImg, postName, postImg } = ctx.request.body
            let isSelect = false;
            let goodsItem = { goodsId, goodsName, goodsPrice, goodsImg, count, isSelect };
            // console.log(goodsItem)
            let Item = [];
            let i
            let hi = []
            let Isset = false;
            //先判断用户是否存了这个

            await user.findOne({ username }, (err, doc) => {
                if (err) {
                    console.log(err)
                    throw err
                }

                let newCar = { postName, postImg, products: [{ goodsId, goodsName, goodsPrice, goodsImg, count, isSelect }] }
                //如果没有则先直接插入

                if (doc.shopCarList.length === 0) {
                    doc.shopCarList.push(newCar);
                    try {
                        let query = doc.save();
                        ctx.body = { statu: 0, msg: '没有数据直接插入' }
                    } catch (e) {
                        console.log(e)
                    }
                } else {
                    //原本中有数据则要先便利一边
                    doc.shopCarList.forEach(car => {
                        // console.log(car.postName)
                        Item = [] //初始化
                        //初始化
                        if (car.postName === postName) {
                            Isset = true;
                            car.products.forEach(car1 => {
                                if (car1.goodsId === goodsId) {
                                    Item.push(car1)
                                    car1.count = car1.count + count;
                                }
                            })
                            // console.log('11111111111',Item.length)
                            if (Item.length === 0) {
                                car.products.push(goodsItem) //相同上传者不同商品
                                try {
                                    let query2 = doc.save();
                                    i = 1
                                    ctx.body = { statu: 0, msg: '相同没有相同商品直接插入' }
                                } catch (e2) {
                                    console.log(e2)
                                }
                            } else {
                                try {
                                    let query1 = doc.save();
                                    ctx.body = { statu: 0, msg: 'count+1' }
                                    i = 1
                                } catch (e1) {
                                    console.log(e1)
                                }

                            }

                        } else {
                            Isset = false
                            hi.push(Isset)
                        }
                    })
                    // console.log('22222',Isset)
                    //循环出来 还是false 的话说明就没有相同名字的了
                    if (i !== 1) {
                        doc.shopCarList.push(newCar)
                        try {
                            let query3 = doc.save()

                            ctx.body = { statu: 0, msg: '不相同名字' }
                        } catch (e3) {
                            console.log(e3)
                        }

                    }
                }
            })
            next();
        } else {
            ctx.body = { statu: -1, msg: '请登录' }
        }

    })
    .post('/getShopCar', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let username = ctx.request.body.username;
            console.log('username',username)
            await user.findOne({ username }, (err, doc) => {
                if (err) {
                    console.log(err)
                    ctx.body = {
                        statu: 1,
                        msg: '服务器出错,请稍后'
                    }
                };
                ctx.body = { statu: 0, msg: doc }
            })
        } else {
            ctx.body = { statu: -1, msg: '请登录' }
        }

    })
    //对购物车的东西实时更新
    .post('/saveCar', async (ctx, next) => {
        let { username, goodsId, count } = ctx.request.body
        if (username === '') {
            ctx.body = {
                statu: -1,
                msg: '请登录'
            }
            return false;
        }
        await user.findOne({ username }, (err, doc) => {
            if (err) {
                ctx.body={
                    statu:1,
                    msg:'服务器出现错误'
                }
                return false;
            }
            doc.shopCarList.forEach(car => {
                car.products.forEach(goods => {
                    if (goods.goodsId === goodsId) {
                        goods.count = count
                        try {
                            let query = doc.save()
                            ctx.body = { statu: 0, msg: '更新成功' }
                        } catch (e) {
                            console.log(e)
                            ctx.body = { statu: 1, msg: '更新错误' }
                        }

                    }
                })
            })
        })

    })
    //关键字
    .get('/search', async (ctx, next) => {
        let query = ctx.request.query.key
        // console.log(query)
        var qs = new RegExp(query + '\[a-zA-Z0-9_\u4e00-\u9fa5]{0,80}', 'g')

        let y
        await type.findOne({
            'childrens': qs
        }, (err, doc) => {
            console.log(doc)
            if (err) {
                console.log(err)
                return false;
            }
            if (!doc) {
                ctx.body = { msg: '暂无该商品' }
                return;
            } else {
                y = doc.childrens.join()
                let i = y.match(qs)
                // console.log(i)
                ctx.body = { statu: 0, msg: i }

            }
        })
    })
    .get('/searchGoods', async (ctx, next) => {
        let username = ctx.request.query.username||''
        let query = ctx.request.query.key
        let page = ctx.request.query.page
        let num = (ctx.request.query.goodsNums-0) || 5 //每页数量
        let start = (page - 1) * num //从哪里开始
        if (username ===''){
            try {
                let result = await good.find({ goodsType: { '$regex': query, $options: '$i' } }).skip(start).limit(num).exec()
                ctx.body = { statu: 0, msg: result }
            } catch (e) {
                console.log(e)
                ctx.body={
                    statu:1,
                    msg:'服务器出现错误,稍后再试'
                }
            }
        } else{
            //查找数据库
            user.findOne({username},async (err,doc)=>{
               if (err){
                   console.log(err)
                   ctx.body={
                       statu:1,
                       msg:'服务器出现错误,稍后再试'
                   }
               }
                if ("searchConst" in doc){
                    doc.searchConst.push(query)
                } else{
                    doc.searchConst = query
                }
                try{
                    let newdoc = await doc.save()
                }catch (e) {
                    console.log(e)
                    ctx.body={
                        statu:1,
                        msg:'服务器出现错误,稍后再试'
                    }
                }

            })
            try {
                let result = await good.find({ goodsType: { '$regex': query, $options: '$i' } }).skip(start).limit(num).exec()
                ctx.body = { statu: 0, msg: result }
            } catch (e) {
                console.log(e)
                ctx.body={
                    statu:1,
                    msg:'服务器出现错误,稍后再试'
                }
            }
        }

    })
    .get('/removeGoods', async (ctx, next) => {
        let id = ctx.request.query.id
        var imgAdd = []
        await good.findOne({ goodsId: id }, (err, doc) => {
            if (err) {
                ctx.body = { statu: 1, msg: '下架失败，请稍后再试' }
                return;
            }
            // console.log(doc)
            imgAdd = doc.imgadd.split(',')
            //删除图片信息
            let rex = new RegExp(id + '\\w{0,20}', 'g')
            for (let i = 0; i < imgAdd.length; i++) {
                fs.unlink('./public/goodsimg/' + imgAdd[i], (err1) => {
                    if (err1) {
                        ctx.body = { statu: 1, msg: '下架失败，请稍后再试' }
                        return;
                    }
                })
            }
            //删除文档
            try {
                let query = doc.remove()
                ctx.body = { statu: 0, msg: '下架成功' }
            } catch (e2) {
                console.log(e2)
                ctx.body = { statu: 1, msg: '下架失败，请稍后再试' }
            }
        })
    })
    //购物车中删除商品
    .get('/removeGoodsByIndex', async (ctx, next) => {
        let { username, indx, postname, y } = ctx.request.query
        await user.findOne({ username }, (err, doc) => {
            if (err) {
                ctx.body = { statu: 1, msg: '删除失败，请稍后再试' }
                console.log(err)
                return false;
            }
            //删除商品
            doc.shopCarList.every(good => {
                for (let i = 0; i < doc.shopCarList.length; i++) {
                    if (good.postName === postname) {
                        good.products.splice(indx, 1)
                        return false; //跳出循环
                    }
                }
            })
            //删除整个列表
            doc.shopCarList.forEach(goods => {
                if (goods.products.length === 0) {
                    doc.shopCarList.splice(y, 1)
                    return false; //跳出循环
                }
            })
            try {
                let query = doc.save()
                ctx.body = { statu: 0, msg: '删除成功' }
            } catch (e5) {
                console.log(e5)
                ctx.body = { statu: 1, msg: '删除失败，请稍后再试' }
            }

        })
    })
    //返回随机三个商品
    .get('/getAll', async (ctx, next) => {
        //设置展示个数
        let num = (ctx.request.query.goodsNums-0) || 6
        let arr = []
        let msg = []
        let query = await good.find({}, (err, doc) => {
            if (err) {
                console.log(err)
                ctx.body = { statu: 1, msg: '请稍后再试' }
            }
            //取随机数
            for (let i = 0; i < doc.length; i++) {
                if (arr.length === num) {
                    break;
                } else {
                    let indx = Math.floor(Math.random() * doc.length)
                    if (arr.indexOf(indx) === -1) {
                        //-1表示数组中没有这个数
                        arr.push(indx)
                    }
                }
            }
            for (let j = 0; j < arr.length; j++) {
                msg.push(doc[arr[j]])
            }
            ctx.body = { statu: 0, msg: msg }
        })

    })
    .get('/getCategory', async (ctx, next) => {
        await category.find({}, (err, doc) => {
            if (err) {
                console.log(err)
                ctx.body = { statu: 1, msg: '请稍后再试' }
            }
            console.log(doc)
            ctx.body = {
                statu: 0,
                msg: doc
            }
        })
    })
    .post('/getVerify', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let username = ctx.request.body.username
            let email
            let res = await user.findOne({ username }, (err, doc) => {
                if (err) {
                    ctx.body = {
                        statu: 1,
                        msg: '请稍后再试'
                    }
                    console.log(err)
                }
                email = doc.email;

            })
         const saveExpire= await Store.hget(`node:${username}`,'expire')
        if(saveExpire && new Date().getTime()-saveExpire < 0){
            ctx.body={
                statu:1,
                msg:'验证过于频繁,一分钟内一次'
            }
            return false;
        }
            //创建服务
            let transporter = nodeMailer.createTransport({
                service: 'qq',
                port: 465,
                secureConnection: true,
                auth: {
                    user: Email.smtp.user(),
                    pass: Email.smtp.pass()
                }
            })
            let ko = {
                code: Email.smtp.code(),
                email: email,
                expire: Email.smtp.expire(),
                user: username
            }
            let mailOptions = {
                from: `"认证邮件"<${Email.smtp.user()}>`,
                to: ko.email,
                subject: '《xianyuba》',
                html: `您本次的验证码是:<h1>${ko.code}</h1>，有效期为5分钟`
            }
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    ctx.body = {
                        statu: 1,
                        msg: err
                    }
                    console.log(err)
                } else {
                    Store.hmset(`node:${ko.user}`, 'code', ko.code, 'expire', ko.expire, 'email', ko.email)
                }
            })
            ctx.body = {
                statu: 0,
                msg: '验证码已发送,可能会有延时'
            }
        } else {
            ctx.body = {
                statu: -1,
                msg: '请先登录在进行操作'
            }
        }

    })
    //验证验证码
    .post('/checkVerify', async (ctx, next) => {
        if (ctx.cookies.get("name")) {
            let { username, code,postName} = ctx.request.body
            //redis中取数据
            console.log('postName',postName)
            user.findOne({"username":postName},async (err,doc)=>{
                if (err){
                    console.log(err)
                    ctx.body={
                        statu:1,
                        msg:'服务器出现错误,稍后再试'
                    }
                }
                console.log(doc)
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
    //最近更新
    .post('/cainixihuan',async (ctx,next)=>{
        let username = ctx.request.body.user||''
        if (username ===''){
           await Axios.get('http://127.0.0.1:3000/goods/getAll',{
                params:{
                    goodsNums:6
                }
           })
                .then(res=>{
                    ctx.body = {
                        msg:res.data.msg
                    }
                })
                .catch(e=>{
                    console.log(e)
                })
        }else{
            let goodsArr = []
            let arr = []
            try{
                arr = await user.findOne({username})
            }catch (e) {
                console.log(e)
                ctx.body={statu:1,msg:'请稍后再试'}
            }
            if (arr.searchConst.length!==0){
                if (arr.searchConst.length>2){
                    //先截取后面两个
                    let i = arr.searchConst.length;
                    let arr1 = arr.searchConst.splice(i-2,2);
                    //依次查询
                    for(let j = 0;j<arr1.length;j++){
                      let i =  await Axios.get('http://127.0.0.1:3000/goods/searchGoods',{
                            params:{
                                key:arr1[j],
                                goodsNums:3
                            }
                        })
                        goodsArr=goodsArr.concat(i.data.msg)
                    }
                    //如果商品不够6个 则随机补上
                    if (goodsArr.length!==6){
                        await Axios.get('http://127.0.0.1:3000/goods/getAll',{
                            params:{
                                goodsNums:(6-goodsArr.length)
                            }
                        })
                            .then((res1)=>{
                                goodsArr=goodsArr.concat(res1.data.msg)
                            })
                    }
                }else{
                    //只有一个关键字
                    let arr2 = arr.searchConst[0]
                    await Axios.get('http://127.0.0.1:3000/goods/searchGoods',{
                        params:{
                            key:arr2,
                            goodsNums:3
                        }
                    })
                        .then(res=>{
                            goodsArr=goodsArr.concat(res.data.msg)
                        })
                        .catch(e=>{
                            console.log(e)
                            ctx.body={
                                statu: 1,
                                msg: '请稍后再试'
                            }
                        })
                    //如果商品不够6个 则随机补上
                    if (goodsArr.length!==6){
                        await Axios.get('http://127.0.0.1:3000/goods/getAll',{
                            params:{
                                goodsNums:(6-goodsArr.length)
                            }
                        })
                            .then((res1)=>{
                                goodsArr=goodsArr.concat(res1.data.msg)
                            })
                    }
                }
                ctx.body = {msg:goodsArr}
            } else{
                //没有关键字
                console.log(222222)
                await Axios.get('http://127.0.0.1:3000/goods/getAll',{
                    params:{
                        goodsNums:6
                    }
                })
                    .then(res=>{
                        ctx.body = {
                            msg:res.data.msg
                        }
                    })
                    .catch(e=>{
                        console.log(e)
                    })
            }
        }
    })




module.exports = router