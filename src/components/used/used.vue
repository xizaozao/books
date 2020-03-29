<template>
    <div class="teml">
        <nav-bar title="发布的置换"></nav-bar>
         <!--展示个人的置换-->
        <ul>
                <li v-for="goods in goodsInfo" :key="goods.goodsId">
                    <div class="goodsimg">
                        <img :src="goods.imgadd[0]" width="98%" height="98%">
                    </div>
                    <div class="desc">
                        <div class="title">{{goods.goodsName}}</div>
                    </div>
                    <div class="goodsinfo">
                        <div class="goodsprice">￥{{goods.goodsPrice}}</div>
                        <div class="posttime">{{goods.createTime|relTime}}</div>
                        <b @click="ishow">+</b>
                    </div>
                    <div class="btn" v-if="isShow">
                        <van-button size="small" round class="btnPosition" @click="explation(goods.goodsId)">下架</van-button>
                        <van-button size="small" round class="btnPosition" @click="edit(goods)">修改</van-button>
                    </div>
                </li>
        </ul>
        <van-button size="large" plain hairline type="primary" :loading="isEnter" @click="goPost" style="margin-top: 20px">发布新的置换</van-button>
    </div>
</template>

<script>
    import dataTool from '../../dataTool'
    export default {
        inject:['reload'], //注入重新加载页面依赖
        created(){
            if(localStorage.userInfo) {
                this.username = localStorage.userInfo
            }else{
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
            //渲染数据
            this.$axios.get('/api/goods/used/getGoods',{
                params:{
                    username:this.username
                }
            })
                .then(res=>{
                    if(res.data.statu!==-1){
                        if (res.data.statu===1){
                            this.$toast({
                                type:'fail',
                                message:res.data.msg
                            })
                            return;
                        }
                        var d = []
                        //处理数据
                        d=dataTool.getData(res.data.res);
                        // console.log(d)
                        for(let i =0;i<res.data.res.length;i++){
                            res.data.res[i].imgadd = d[i]
                        }

                        this.goodsInfo = res.data.res
                    }else{
                        this.$toast({
                            type:'fail',
                            message:res.data.msg
                        })
                        return false;
                    }
                })
                .catch(err=>{
                    console.log(err)
                })
        },
        data(){
          return{
              isEnter:false, //防止多次发请求
              goodsInfo:[],  //商品信息
              isShow:false
          }
        },
        methods:{
            edit(goods){
                this.$router.push({name:'upGoods',params:{goods}})
            },
          goPost(){
              //是否填写个人信息
              this.$axios.post('/api/users/findWx',{
                  username:localStorage.userInfo
              })
                  .then(res=>{
                      if(res.data.statu!==-1){
                          if (res.data.statu===1){
                              this.$toast({
                                  type:'fail',
                                  message:'请先在个人中心完善信息'
                              })
                              return;
                          }
                          this.$router.push({name:'upGoods'})
                      }else{
                          this.$toast({
                              type:'fail',
                              message:res.data.msg
                          })
                          return false;
                      }
                  })

            },
            ishow(){
                this.isShow=!this.isShow
                var btn = document.getElementsByTagName('li')
              if (this.isShow){
                  for(let i =0;i<btn.length;i++){
                      btn[i].style.marginBottom=2.6+"rem"
                  }

              } else{
                  for(let i =0;i<btn.length;i++){
                      btn[i].style.marginBottom=""
                  }
              }
            },
            //下架商品
            explation(id){
               this.$axios.get('/api/goods/removeGoods',{
                   params:{
                       id
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
                   .catch(e=>{
                       console.log(e)
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
    }
</script>

<style scoped>
    .teml{
        margin-bottom: 60px;
    }
    ul{
        overflow: hidden;
    }
    li{
        list-style: none;
        display: block;
        width: 100%;
        height: 120px;
        background-color: #f7f7f7;
        margin-top: 5px;
        border-bottom: darkgrey solid 0.05rem;
        transition: margin-bottom 1.5s;
    }
    li .goodsimg{
        margin-left: 10px;
        width: 6.5rem;
        height: 100%;
        float: left;

    }
    li .goodsimg img{
        border-radius: 15px;
    }
    li .desc{
        margin-left: 5px;
        width: 12rem;
        float: left;
        height: 95px;
        color: black;
        font-size: 14px;
    }
    .goodsinfo{
        width: 12rem;
        height: 1rem;
        float: left;
    }
    .goodsinfo b{
        float: right;
        bottom: 1rem;
        color: #999999;
        left: 12px;
        position: relative;
        font-size: 20px;
        font-weight: bold;
    }
    .goodsprice{
        width: 5rem;
        float: left;
        color: red;
        font-size: 1rem;
    }
    .posttime{
        float: left;
        width: 6.5rem;
        color: darkgrey;
        font-size: 14px;
        text-align: center;
    }
    .btn{
        width: 100%;
        height: 2.3rem;
        background-color: #f0f0f0;
        float: left;
    }
    .btn .btnPosition{
        /*bottom: 5px;*/
        margin-top: 5px;
        float: right;
    }
</style>