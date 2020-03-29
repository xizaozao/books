const mongoose = require('mongoose')
const Schema = mongoose.Schema

let goodsCategory = new Schema({
    "MALL_CATEGORY_NAME":String,
    "IMAGE":String,
})

module.exports = mongoose.model('category',goodsCategory,'categorys')