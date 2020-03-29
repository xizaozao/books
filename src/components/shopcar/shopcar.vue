<template>
    <div>
        <nav-bar title="购物车"></nav-bar>
        <!--购物详情-->
        <ul id="fy">
            <li v-for="(goods,index) in shopCarInfo.shopCarList" :key="index">
                <div class="payfor-box" >
                    <div class="payfor-head">
                        <!--选择按钮-->
                        <div class="payfor-checked">
                            <!--<van-checkbox v-model="goods.Selected" checked-color="rgb(161,145,78)"></van-checkbox>-->
                        </div>
                        <div class="payfor-userImg">
                            <img :src="goods.postImg" width="100%" height="100%">
                        </div>
                        <div class="payfor-userName">{{goods.postName}}</div>
                    </div>
                    <div class="payfor-body" v-for="(goodsInfo,index1) in goods.products" :key="goodsInfo.goodsId">
                        <b @click="ishow">删除</b>
                        <div class="payfor-left">
                            <van-checkbox v-model="goodsInfo.isSelect" checked-color="rgb(161,145,78)" ></van-checkbox>
                        </div>
                        <div class="payfor-right">
                              <div>
                                  <div class="goodsimg">
                                      <img :src="goodsInfo.goodsImg" alt="" width="100%" height="100%">
                                  </div>
                                  <div class="goodsInfo">
                                      <router-link :to="{path:'/goodsdetail/'+goodsInfo.goodsId}">
                                      <span class="goodsTitle">{{goodsInfo.goodsName}}</span>
                                      </router-link>
                                      <span class="goodsPrice">￥{{goodsInfo.goodsPrice}}</span>
                                      <van-stepper v-model="goodsInfo.count" class="goodsNum" @change="editCart(goodsInfo)" />
                                  </div>
                              </div>
                        </div>

                        <div class="btn" v-if="isShow">
                            <van-button size="mini" type="danger" round class="btnPosition"  @click="removeByIndex(index,index1,goods.postName)">确定删除</van-button>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
        <div class="shopNull" v-if="showNull">
            <div class="shopNull-img">
                <img src="../../assets/img/shopNull.png" width="100%" height="100%">
            </div>
            <p class="shopNull-info">收藏盒空空如也~</p>
        </div>
        <!--总计栏-->
        <van-submit-bar
                :price="stract.price"
                button-text="提交订单"
                @submit="onSubmit"
        >
            <van-checkbox v-model="checked">全选</van-checkbox>
        </van-submit-bar>
    </div>
</template>
<script>
   import dataTool from '../../dataTool'
    export default {
        inject:['reload'], //注入重新加载页面依赖
        data(){
            return{
                checkedAll:false,
                checked:false,
                num:1,
                shopCarInfo:[],
                item:[],
                computedInfo:[],
                isShow:false,
                showNull:false
            }
        },
        created(){
            if (localStorage.userInfo){
               let  username =localStorage.userInfo
                //请求购物车数据
                this.$axios.post('/api/goods/getShopCar',{username})
                    .then(res=>{
                        if(res.data.statu!==-1){
                            if(res.data.statu===1){
                                this.$toast({
                                    type:'fail',
                                    message:res.data.msg,
                                    duration:1500
                                })
                                return false;
                            }
                            if(res.data.msg.shopCarList.length>0){
                                this.showNull = false;
                                res.data.msg.shopCarList.forEach(val=>{
                                    val.Selected = false
                                })
                                this.shopCarInfo=res.data.msg;
                            }else{
                                //购物车空的
                                this.showNull = true;
                            }

                        }else{
                            this.checkTost()
                        }
                    })
                    .catch(err=>{
                        console.log(err)
                    })
            }else{
                this.checkTost()
            }
        },
        methods:{
            onSubmit(){
                this.$toast({
                    type:'fail',
                    message:'该功能还未开通哦'
                })
            },
            selectSelf(e,index){
                console.log(e)
                console.log(this.shopCarInfo.shopCarList[index])
            },
            editCart(goodsInfo){
                let username = localStorage.userInfo||''
                    //每次文档更新都发送请求保存数据库
                    this.$axios.post('/api/goods/saveCar',{
                        username:username,
                        goodsId:goodsInfo.goodsId,
                        count:goodsInfo.count
                    })
                        .then(res=>{
                            if(res.data.statu===-1){
                                this.checkTost()
                            }
                        })
                        .catch(e=>{
                            console.log(e)
                        })
            },
            ishow(){
                this.isShow=!this.isShow
                var doc = document.getElementsByClassName('payfor-body')
                if(this.isShow){
                    for(let i = 0;i<doc.length;i++){
                         doc[i].style.marginBottom=5+'rem'

                    }
                }else {
                    for(let i = 0;i<doc.length;i++){
                        doc[i].style.marginBottom=0
                    }
                }


            },
            removeByIndex(i,index,name){
                if(!localStorage.userInfo){
                   this.checkTost()
                }
                let username = localStorage.userInfo
                 this.$axios.get('/api/goods/removeGoodsByIndex',{
                     params:{
                         y:i,
                         indx:index,
                         username:username,
                         postname:name
                     }
                 })
                     .then(res=>{
                         if(res.data.statu===0){
                             this.$toast({
                                 type:'success',
                                 message:res.data.msg,
                                 duration:1500
                             })
                             this.reload();
                         }else {
                             this.$toast({
                                 type:'fail',
                                 message:res.data.msg,
                                 duration:1500
                             })
                         }
                     })
                     .catch(e2=>{
                         console.log(e2)
                     })

            },
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
        },
        computed: {
            //计算商品的总价钱
            stract(){
                 let price =0;
                 if(this.shopCarInfo.shopCarList!=null){
                     this.shopCarInfo.shopCarList.forEach(car=>{
                         car.products.forEach(goods=>{
                             if(goods.isSelect){
                                 price+=((goods.goodsPrice) *goods.count)*100
                             }
                         })
                     })
                 }
                return {price}
            },
            //计算当前购物车数量

        }
    }
</script>
<style scoped>
    .shopNull{
        margin-left: 6rem;
        margin-top: 7rem;
    }
    .shopNull-img{
        width: 8rem;
        height: 8rem;
    }
    .shopNull-info{
        font-size: 14px;
        color:rgb(161,145,78);
    }
    #fy{
        margin-bottom: 125px;
    }
    ul li{
        margin-top: 15px;
    }
.payfor-head{
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    width: 18rem;
    height: 3rem;
    /*background-color: #55a532;*/
    overflow: hidden;
    background-color: #ffffff;
    border-top: silver 1px solid;
    border-bottom: silver 1px solid;
    border-radius: 10px 10px 0 0 ;
    margin-left: 1rem;
}
.payfor-checked{
    margin-left: 10px;
}
    .payfor-userImg{
        width: 2rem;
        height: 2rem;
        /*background-color: red;*/
        margin-left: 5px;
        margin-top: 0.5rem;
    }
    .payfor-userImg img{
        border-radius: 15px;
    }
    .payfor-userName{
        margin-left: 5px;
        margin-top: .5rem;
        font-size: 1.2rem;
        font-family: "Helvetica Neue",Helvetica,Arial,"Microsoft Yahei","Hiragino Sans GB","Heiti SC","WenQuanYi Micro Hei",sans-serif;
    }
    .payfor-body{
        width: 18rem;
        height: 7rem;
        background-color: #ffff;
        border-bottom: silver solid 1px;
        border-radius: 0 0 10px 10px ;
        transition: margin-bottom 1.5s;
        /*margin-bottom: 1.5rem;*/
        margin-left: 1rem;
    }
    .payfor-body b{
        float: right;
        position: relative;
        top: 5.5rem;
    }
.payfor-body .payfor-left{
        width: 1.5rem;
        height: 6rem;
        position: absolute;
        margin-top: 1rem;
    margin-left: 10px;
    float: right;
    }
.payfor-body .payfor-right{
    width: 15rem;
    height: 6rem;
    float: right;
}
.payfor-body .payfor-right .goodsimg{
    padding-top: 0.2rem;
    width: 5.5rem;
    height: 5.5rem;
    /*background-color: red;*/
    float: left;
}
    .payfor-body .payfor-right .goodsimg img{
        border-radius: 5px;
    }
.payfor-body .payfor-right .goodsInfo{
    width: 9.5rem;
    float: left;
    position: relative;
}
.payfor-body .payfor-right .goodsInfo span:nth-child(1){
    display: block;
      width: 9rem;
    height: 3rem;
    overflow : hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;      /* 可以显示的行数，超出部分用...表示*/
    -webkit-box-orient: vertical;
    font-size: 14px;
    text-decoration: none;
    color: #222222;
    /*overflow: hidden;*/
}
.payfor-body .payfor-right .goodsInfo span:nth-child(2){
    /*margin-top: 1.3rem;*/
    font-size: 14px;
    float: left;
    color: rgb(161,145,78);
    position: absolute;
    display: block;
    width: 9rem;
    height: 1rem;
}
.payfor-body .payfor-right .goodsInfo .goodsNum{
    float: left;
    margin-top: 1.5rem;
    /*position: absolute;*/
    top:4rem;
}
    .btn{
        width: 100%;
        height: 1.5rem;
        /*background-color: red;*/
        float: left;
        margin-top: 12px;
    }
    .btnPosition{
        margin-top: 5px;
        float: right;
    }
</style>
