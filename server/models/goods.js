const mongoose = require('mongoose')

const Schema = mongoose.Schema;

let goodsId = Schema.Types.ObjectId

let goodsSchema = new Schema({
    "username":{type:String},
    "goodsId":String,
    "goodsName":String,
    "goodsDetails":String,
    "goodsPrice":Number,
    "goodsNum":Number,
    "goodsType":String,
    "imgNum":Number,
    "createTime":{type:Date, default:Date.now()},
    "imgadd":String,
    "goodsTime":String,
    "goodsNew":String,
})

module.exports = mongoose.model('good',goodsSchema)