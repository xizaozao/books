
const mongoose = require('mongoose');
// Mongoose 里，一切都始于Schema
let Schema = mongoose.Schema;
//让mongodb自动生成的id 作为userid
let ObjectId = Schema.Types.ObjectId

let userSchema = new Schema({
    "userId":ObjectId,
   "username":{type:String},
   "pas":String,
    "headImg":String,
    "createTime":{type:Date, default:Date.now()},
    "tel":{type:String},
    "wechat":{type:String},
    "shopCarList":[{
        "postName":String,
        "postImg":String,
        "products":[{
            "goodsName":String,
            "goodsImg":String,
            "goodsId":String,
            "goodsPrice":Number,
            "count":Number,
            "isSelect":Boolean,
        }],

    }],
    "email":String,
    "searchConst":Array,
});

module.exports = mongoose.model('user',userSchema);