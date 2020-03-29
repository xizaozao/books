<template>
    <div style="width: 100%">
        <nav-bar title="商品详情"></nav-bar>
        <!--轮播图-->
        <div class="goods-swipe">
            <van-swipe :autoplay="3000" indicator-color="while">
                <van-swipe-item v-for="(goods,index) in imgs" :key="index">
                    <img :src="goods" width="100%" height="100%">
                </van-swipe-item>
            </van-swipe>
        </div>
        <!--内容-->
        <div class="goodsInfo" v-if="goodsInfo.length!==0">
            <ul>
                <li><span class="product-desc-span">{{goodsInfo[0].goodsName}}</span></li>
                <li><span class="product-price-span">￥{{goodsInfo[0].goodsPrice}}</span></li>
            </ul>
            <p class="goodtitle">--------商品详情--------</p>
            <ul class="product-detail">
                <li>详细介绍:{{goodsInfo[0].goodsDetails}}</li>
                <li>商品规格:</li>
                <li>购买时间:{{goodsInfo[0].goodsTime}}</li>
                <li>商品新旧:{{goodsInfo[0].goodsNew}}</li>
                <li>商品数量:{{goodsInfo[0].goodsNum}}</li>
            </ul>
        </div>
        <!--底部-->
        <van-goods-action>
            <van-goods-action-mini-btn icon="chat-o" @click="getPostInfo" text="联系他(她)" />
            <!-- <van-goods-action-mini-btn info="0" icon="cart-o" text="待开发" /> -->
            <van-goods-action-big-btn text="收藏 it" @click="addCar" :loading="isOk" />
            <van-goods-action-big-btn primary text="❤ I want it" @click="getPostInfo" />
        </van-goods-action>
        <!--弹出验证码-->
        <!-- <van-popup v-model="show" position="left">
            <div class="PostInfo" v-if="ShowVerify">
                <van-cell-group>
                    <van-field v-model="sms" center clearable label="邮箱验证码" placeholder="请邮箱短信验证码" >
                        <van-button slot="button" size="small" type="primary" @click="sendVerify">发送验证码</van-button>
                    </van-field>
                </van-cell-group>
                <van-button size="large" type="danger" @click="checkVerify">提交</van-button>
            </div>
        </van-popup> -->
    </div>
</template>
<script>
import dataTool from '../../dataTool'
export default {
    created() {
        //获取id
        let goodsId = this.$route.params.id;
        // console.log(goodsId)
        this.$axios.get('/api/goods/goodsInfo', {
                params: {
                    id: goodsId
                }
            })
            .then(res => {
                var d = []
                d = dataTool.getData(res.data.msg)
                for (let i = 0; i < res.data.msg.length; i++) {
                    res.data.msg[i].imgadd = d[i]
                }
                this.goodsInfo = res.data.msg;
                this.imgs = this.goodsInfo[0].imgadd
                // console.log(this.goodsInfo[0])
            })
            .catch(err => {
                console.log(err)
            })

    },
    updated() {
        this.$axios.get('/api/users/getHeadImg', {
                params: {
                    username: this.goodsInfo[0].username
                }
            })
            .then(resImg => {
                // resImg.data.msg = dataTool.Decrypt(resImg.data.msg)
                if(resImg.data.statu!==1){
                    this.PostImg = 'http://127.0.0.1:3000' + resImg.data.msg.headImg
                    return ;
                }
                this.PostImg = ''

            })
            .catch(err1 => {
                console.log(err1)
            })
    },
    data() {
        return {
            goodsInfo: [],
            imgs: [],
            isOk: false,
            PostImg: '',
            show: false,
            sms: '',
            ShowVerify:true,
            we:''
        }
    },
    methods: {
        addCar() {
            this.isOk = true;
            //获取商品id
            //先判断有没有登录
            //加入localStorage
            if (localStorage.userInfo) {
                username = localStorage.userInfo
                this.$axios.post('/api/goods/addCar', {
                        username: username,
                        postName: this.goodsInfo[0].username,
                        goodsId: this.goodsInfo[0].goodsId,
                        goodsName: this.goodsInfo[0].goodsName,
                        goodsPrice: this.goodsInfo[0].goodsPrice,
                        count: 1,
                        goodsImg: this.goodsInfo[0].imgadd[0],
                        postImg: this.PostImg
                    })
                    .then(res => {
                        if (res.data.statu === 0) {
                            this.isOk = false;
                        }
                        this.$toast({
                            type: 'success',
                            message: '加入成功',
                            duration: 1500
                        })
                        // console.log(res.data)
                    })
                    .catch(e => {
                        this.$toast({
                            type: 'fail',
                            message: '加入失败，请刷新后再试',
                            duration: 1500
                        })
                        console.log(e)
                    })
            } else {
                this.checkTost()
            }

            //传入数据库
            let username = localStorage.userInfo;


        },
        getPostInfo() {
            //弹出验证码框
            // this.show = true
            // this.ShowVerify =true
            this.getChat()
        },
        getChat() {
            if (localStorage.userInfo) { 
               let username = localStorage.userInfo
                this.$axios.post('/api/users/getChat', {
                        username: username,
                        code: this.sms,
                       postName: this.goodsInfo[0].username
                    })
                    .then(({data}) => {
                        // console.log("data",data)
                        if (data.statu !== -1) {
                            if (data.statu === 1) {
                                this.$toast({
                                    type: 'fail',
                                    message: data.msg,
                                    duration: 1500
                                })
                             return false;
                            }
                            this.ShowVerify = false
                            this.$dialog.alert({
                                message: '该卖家的wechat=>'+data.doc.wechat+ '<br/>该卖家的电话=>'+data.doc.tel
                            }).then(() => {
                                // on close
                                this.show = false
                            });


                            // this.InfoShow = true;
                        } else {
                            this.checkTost()
                        }
                    })
            } else {
                this.checkTost()
            }
        },
        // sendVerify(){
        //     if (localStorage.userInfo) {
        //      let username = localStorage.userInfo
        //         this.$axios.post('/api/goods/getVerify', {
        //                 username: username,
        //             })
        //             .then(({ data }) => {
        //                 if (data.statu !== -1) {
        //                     if (data.statu === 1) {
        //                         this.$toast({
        //                             type: 'fail',
        //                             message: data.msg,
        //                             duration: 1500
        //                         })
        //                      return false;
        //                     }
        //                     //成功发送
        //                    this.$toast({
        //                             type: 'success',
        //                             message: data.msg,
        //                             duration: 1500
        //                         }) 
        //                 } else {
        //                     this.checkTost()
        //                 }
        //             })
        //     } else {
        //         this.checkTost()
        //     }
        // },
        checkTost(){
            let second = 3;
            const timer = setInterval(() => {
                second--;
                if (second) {
                    this.$toast({
                        type:'fail',
                        message : `您还没有登录哦请先登录,倒计时 ${second} 秒`
                    })
                } else {
                    clearInterval(timer);
                    this.$toast.clear();
                    this.$router.push({
                        path:'/register'
                    })
                    return false;
                }
            }, 1000);
        }

    }
}
</script>
<style scoped>
.goods-swipe {
    width: 100%;
    height: 18rem;
    /*margin-bottom: 30px;*/
}

.goodsInfo {
    /*display: flex;*/
    width: 100%;
    /*margin-top: 30px;*/
    position: relative;
    background: rgb(255, 255, 255);
    margin-bottom: 100px;
}

.goodsInfo ul {
    width: 100%;
    overflow: hidden;
}

.goodsInfo ul li {
    width: 100%;
    list-style: none;
    /*border-bottom: #999999 solid 1px;*/
}

.goodsInfo .product-desc-span {
    width: 100%;
    height: 3rem;
    font-size: 14px;
    line-height: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, "Microsoft Yahei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
}

.goodsInfo .product-price-span {
    color: red;
}

.goodsInfo li s {
    font-size: 0.8rem;
    color: rgb(161, 145, 78);
}

.goodtitle {
    width: 99%;
    height: 1.5rem;
    /*padding: 5px;*/
    margin-top: 5px;
    font-size: 1rem;
    text-align: center;
    overflow: hidden;
    background: ghostwhite;
    color: #999999;
}

.product-detail {
    font-size: 0.8rem;
    color: #999999;
    font-family: "Helvetica Neue", Helvetica, Arial, "Microsoft Yahei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
}

.PostInfo {
    width: 100%;
    height: 8rem;
}
</style>