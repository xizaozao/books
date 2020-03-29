const crypoto  = require('crypto-js');
const key = crypoto.enc.Utf8.parse('1234567819ABCDEF')
const iv = crypoto.enc.Utf8.parse('ABCDEF1234123412')
let obj = {};
// 进行数据加密
obj.Encrypt=function (word) {
    let srcs = crypoto.enc.Utf8.parse(word)
    let encrypted = crypoto.AES.encrypt(srcs,key,{iv, mode: crypoto.mode.CBC, padding: crypoto.pad.Pkcs7})
    return encrypted.ciphertext.toString().toUpperCase();
}
// 进行数据解密
obj.Decrypt = function(word){
    let encryptedHexStr = crypoto.enc.Hex.parse(word);
    let srcs = crypoto.enc.Base64.stringify(encryptedHexStr);
    let decrypt = crypoto.AES.decrypt(srcs, key, { iv: iv, mode: crypoto.mode.CBC, padding: crypoto.pad.Pkcs7});
    let decryptedStr = decrypt.toString(crypoto.enc.Utf8);
    return decryptedStr.toString();
}

obj.getImgSize = function(imgDate){
    //获取base64图片大小，返回kb
    // console.log(imgDate)
    let  str = imgDate.replace(/^data:image\/\w+;base64,/,'')
    let strLength = str.length;
    //字节
    let fileLength = parseInt(strLength - (strLength/8) * 2)

    let size = (fileLength/1024).toFixed(2)

    return parseInt(size)
}
obj.compressImg =  function(imgDate){
    // let  str = imgDate.replace(/^data:image\/\w+;base64,/,'')
    let img = new Image()
    img.src=imgDate
    let newUrl

    return new Promise((resolve, reject)=>{
        img.onload = function () {
            let Imgwidth = this.width;
            let Imgheight = this.height;
            let scale = this.width/ this.height;
            let w = 1024 ; //画布大小
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d")
            if(Math.max(Imgheight,Imgwidth)>w){
                if (Imgwidth >Imgheight){
                    canvas.width = w
                    canvas.height = w * Imgheight / Imgwidth
                } else{
                    canvas.height = w
                    canvas.width = w * Imgwidth /Imgheight
                }
            }else{
                canvas.width = Imgwidth
                canvas.height = Imgheight
            }
            ctx.clearRect(0,0,canvas.width,canvas.height)
            ctx.drawImage(this,0,0,canvas.width,canvas.height)

            let base64 = canvas.toDataURL("image/jpeg",0.8)
            // console.log(base64)
            resolve(base64)
        }

    })
}
obj.getData=function (arrData) {
    var a =[];
    var b,c;
    var d= [];
    arrData.forEach((val)=>{
        b =val.imgadd;
        a.push(b);
    })
    a.forEach(val=>{
        c = val.split(/,/)
        d.push(c)
    })
    for (let i =0;i<d.length;i++){
        for (let j=0;j<d[i].length;j++){
            d[i][j] = 'http://127.0.0.1:3000/goodsimg/'+d[i][j]
        }
    }
    return d;
}


export default  obj

