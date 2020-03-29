const crypoto  = require('crypto-js');
const key = crypoto.enc.Utf8.parse('1234567819ABCDEF')
const iv = crypoto.enc.Utf8.parse('ABCDEF1234123412')
let obj = {}

//进行数据加密
obj.Encrypt=function (word) {
    let srcs = crypoto.enc.Utf8.parse(word)
    let encrypted = crypoto.AES.encrypt(srcs,key,{iv, mode: crypoto.mode.CBC, padding: crypoto.pad.Pkcs7})
    return encrypted.ciphertext.toString().toUpperCase();
}

// obj.Encrypt = function(text){
//     return crypoto.AES.encrypt(text,crypoto.enc.Utf8.parse(key),{
//         iv:crypoto.enc.Utf8.parse(iv),
//         mode:crypoto.mode.CBC,
//         padding:crypoto.pad.Pkcs7
//     })
// }
module.exports=obj