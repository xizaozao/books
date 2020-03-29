const mongoose = require('mongoose')
const Schema = mongoose.Schema

let goodsClassify = new Schema({
    "goodsclassify":String,
    "childrens":Array,
})

module.exports = mongoose.model('type',goodsClassify)