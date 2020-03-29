<template>
    <div class="teml">
        <div class="user-poster">
            <div class="user-img">
                <!--显示图片-->
                <div class="img-show">
                    <img :src="this.headImgs" alt="">
                </div>
                <!--添加图片-->
                <van-uploader :after-read="onRead" accept="image/gif, image/jpeg" multiple class="img-add" v-if="loaderOver">
                    <img src="@/assets/img/img-add.png" alt="" width="80px" height="80px">
                </van-uploader>
                    <p class="my-user">{{username}}</p>
            </div>

        </div>
        <!-- <van-row class="user-links">
            <van-col span="6">
                <van-icon name="pending-payment" />
                待付款
            </van-col>
            <van-col span="6">
                <van-icon name="records" />
                待接单
            </van-col>
            <van-col span="6">
                <van-icon name="tosend" />
                待发货
            </van-col>
            <van-col span="6">
                <van-icon name="logistics" />
                已发货
            </van-col>
        </van-row>

        <van-cell-group class="user-group">
            <van-cell icon="records" title="全部订单" is-link />
        </van-cell-group> -->

        <van-cell-group>
            <van-cell icon="points" title="我发布的置换" is-link :to="{name:'used'}" />
            <van-cell icon="setting-o" title="设置" is-link :to="{name:'setInfo'}" />
        </van-cell-group>
    </div>
</template>

<script>
    //获取高
    import dataTool from '../../dataTool'
    export default {
        inject:['reload'],
        data(){
          return{
              username:'', //登录的用户名
              headImgs:[],//头像
              loaderOver:true, //是否有头像
              usimg:''           //表单数据
          }
        },
        created(){
          //检查是否有登录
            if(localStorage.userInfo){
                // console.log('localStorage.userInfo)',localStorage.userInfo)
                this.username = localStorage.userInfo;
            }else{
                this.checkTost()
                return ;
            }
            //请求用户头像
            this.$axios.get('/api/users/getHeadImg',{
                params:{
                    username:this.username
                }
            })
                .then(res=>{
                    if(res.data.statu!==-1){
                        //判断用户是否有头像
                        if(res.data.msg.hasOwnProperty('headImg')){

                            this.headImgs='http://127.0.0.1:3000'+res.data.msg.headImg
                            // this.reload()
                        }else{
                            //显示出添加图片
                            this.loaderOver = true
                        }
                    }else{
                        // this.checkTost()
                    }


                })
        },
        methods:{
            //上传头像  已经经过base64处理
            onRead(file){
               if (file.file.size/1000>2048) {
                   this.$toast({
                       type:'fail',
                       message:'请上传小于2M的图片',
                       duration:1500
                   })
                   return false;
               }
               this.headImgs = file.content
               this.upHeadImg();
            },
            upHeadImg(){
                this.$axios.post('/api/users/upHeadImg',{
                        username:this.username,
                        headImg:this.headImgs
                    
                })
                    .then(res=>{
                        let msg = res.data.msg;
                        this.$toast({
                            type:'success',
                            message:msg
                        })
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
        watch:{
            headImgs:function () {
                // console.log(this.headImgs)
                if (this.headImgs.length!=0){
                    this.loaderOver = false;
                }
            }
        }
    }
</script>

<style scoped>
    .my-user{
        position: relative;
        width: 100%;
        line-height: 1.2rem;
        font-size: 1.2rem;
        text-align: center;
        margin: 1rem auto;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }
    .teml{
        margin-bottom: 60px;
    }
        .user-poster {
            width: 100%;
            display: block;
            height: 16rem;
            background-image: url("../../assets/img/mine-img.png");
            background-size: 100% 100%;
        }

        .user-group {
            margin-bottom: 15px;
        }
        .user-links {
            padding: 15px 0;
            font-size: 12px;
            text-align: center;
            background-color: #fff;

        }
        .van-icon {
            display: block;
            font-size: 24px;
        }
    .img-show{
        width: 80px;
        height: 80px;
        background-color: rgb(247,247,239);
        float: left;
        border-radius: 50px;
    }
    .img-show img{
        width: 100%;
        height: 100%;
        border-radius: 50px;
    }
    .img-add{
        float: left;
        position: absolute;
        z-index: 2;
        margin-left: -80px;
    }
    .user-img{
        position: absolute;
        z-index: 2;
        margin-left: 7.5rem;
        margin-top: 8rem;
    }

</style>