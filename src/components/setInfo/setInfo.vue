<template>
    <div>
        <nav-bar title="个人中心"></nav-bar>
        <van-cell-group>
            <van-cell icon="points" title="头像" >
                <!--显示头像-->
                <div class="headImg">
                    <div class="img-show">
                        <img :src="this.headImgs" width="100%" height="100%">
                    </div>
                    <!--添加图片-->
                    <van-uploader :after-read="onRead" accept="image/gif, image/jpeg" multiple class="img-add">
                        <img src="@/assets/img/right.png" alt="" width="40px" height="40px">
                    </van-uploader>
                </div>

            </van-cell>
            <van-cell icon="gold-coin-o" title="手机号" is-link  @click="telShow=true">
                {{tel}}
            </van-cell>
            <van-cell icon="setting-o" title="修改密码" is-link  @click="changePas=true"/>
            <van-cell icon="setting-o" title="微信账号" is-link @click="wechatShow" >
                {{Wechat}}
            </van-cell>
        </van-cell-group>
        <van-button size="large" type="danger" @click="loginOut">退出此账号</van-button>
        <van-popup v-model="telShow" position="right" :overlay="true"  :close-on-click-overlay="true">
            <div>
                <van-row type="flex" justify="space-around">
                    <van-col span="6"><van-button type="danger" size="small" @click="telShow=false">取消</van-button></van-col>
                    <van-col span="6"><span style="font-size: small">修改手机号</span></van-col>
                    <van-col span="6"><van-button type="primary" size="small" @click="checktel" :loading="isEnter">确定</van-button></van-col>
                </van-row>
                <van-field
                        v-model="temporaryTel"
                        type="number"
                        placeholder="请输入手机号"
                        class = "tel"
                />
            </div>
        </van-popup>

        <van-popup v-model="changePas" position="right" :overlay="true">
            <van-row type="flex" justify="space-around">
                <van-col span="6"><van-button type="danger" size="small" @click="changePas=false">取消</van-button></van-col>
                <van-col span="6"><span style="font-size: small">修改密码</span></van-col>
                <van-col span="6"><van-button type="primary" size="small" @click="checkPas" :loading="isEnter">确定</van-button></van-col>
            </van-row>
            <van-field
                    v-model="temporaryPas"
                    type="password"
                    placeholder="请输入新密码"
                    class = "tel"
            />
        </van-popup>

        <van-popup v-model="showWechat" position="right" :overlay="true"  :close-on-click-overlay="true">
            <div>
                <van-row type="flex" justify="space-around">
                    <van-col span="6"><van-button type="danger" size="small" @click="showWechat=false">取消</van-button></van-col>
                    <van-col span="6"><span style="font-size: small">修改微信号</span></van-col>
                    <van-col span="6"><van-button type="primary" size="small" @click="checkWechat" :loading="isEnter">确定</van-button></van-col>
                </van-row>
                <van-field
                        v-model="temporaryWechat"
                        type="text"
                        placeholder="请输入微信号"
                        class = "tel"
                />

            </div>
        </van-popup>
    </div>

</template>

<script>
    import dataTool from '../../dataTool'
    export default {
        inject:['reload'],
        created(){
            //渲染数据
            // 加载头像
            if(localStorage.userInfo){
                this.username = localStorage.userInfo;
                // console.log(localStorage.getItem('userInfo'))
            }else{
                this.checkTost()
            }
            //请求用户头像
            this.$axios.get('/api/users/getHeadImg',{
                params:{
                    username:this.username
                }
            })
                .then(res=>{
                    // res.data.msg = dataTool.Decrypt(res.data.msg)
                     if(res.data.statu===-1){
                         this.checkTost()

                     }
                    //判断用户是否有头像
                    if(res.data.msg.hasOwnProperty('headImg')){

                        this.headImgs='http://127.0.0.1:3000'+res.data.msg.headImg||''
                    }else{
                        //显示出添加图片
                        this.loaderOver = true
                    }
                })
                .catch(err=>{
                    console.log(err)
                })
            this.getInfoWx()
            this.getInfoTel()
        },
        data(){
            return{
                headImgs:[], //头像信息
                upHeadImgs:[],
                telShow: false, //弹出框
                tel:'', //初始手机号
                showWechat:false, //弹出框
                temporaryTel:'' ,//修改手机号
                changePas:false ,//修改密码页面
                temporaryPas:'', //修改后的密码
                temporaryWechat:'', //修改后的微信号
                Wechat:'' ,//微信号,
                isEnter:false //防止多次发请求
            }
        },
        methods:{
            loginOut(){
                this.$axios.post('/api/users/loginOut')
                    .then(res=>{
                        if (res.data.statu===0) {
                            //点击后退出账号 并且把localstorage清空
                            localStorage.removeItem('userInfo')
                            //跳转到登录界面
                            this.$router.push({
                                path:'/register'
                            })
                        }
                    })
                    .catch(e=>{
                        console.log(e)
                    })

            },
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
                        if(res.data.statu===0){
                            let msg = res.data.msg;
                            this.$toast({
                                type:'success',
                                message:'头像修改成功'
                            })

                        }


                    })
            },
            //初步检查手机号
            checktel(){
                // this.temporaryTel = this.temporaryTel.trim()
                if(!(/^1(3|4|5|7|8)\d{9}$/.test(this.temporaryTel))){
                    this.$toast({
                        type:'fail',
                        message:'请输入正确11位手机号且勿输入空格哦'
                    })
                    return;
                }else if (this.tel ===this.temporaryTel){
                    this.$toast({
                        type:'fail',
                        message:'请勿输入与之前相同的手机号'
                    })
                    return;
                }
                this.isEnter = true
                //查数据库中手机号是否被使用
                this.$axios.post('/api/users/checkTel',{
                    username:this.username,
                    tel:this.temporaryTel

                })
                    .then(res=>{
                        console.log(res.data)
                        if (res.data.statu===0) {
                            this.tel = this.temporaryTel
                            this.$toast({
                                type:'success',
                                message:'修改手机号成功'
                            })

                            this.telShow = false
                            this.isEnter = false
                        }else{
                            this.$toast({
                                type:'fail',
                                message:'手机号已被注册,请重试'
                            })
                            this.isEnter = false
                        }
                    })
                    .catch(err=>{
                        console.log(err)
                        this.$toast({
                            type:'fail',
                            message:'修改手机号失败,请重试'
                        })
                        this.isEnter = false
                    })
                // this.isEnter = false
            },
            //修改密码
            checkPas(){
                //首先去空格

                this.temporaryPas = this.temporaryPas.trim();
                if (this.temporaryPas.length===0){
                    this.$toast({
                        type:'fail',
                        message:'请输入11位密码且请勿输入空格'
                    })
                }
                this.isEnter = true
                //发送请求
                this.$axios.post('/api/users/changePas',{
                    username:this.username,
                    password:this.temporaryPas
                })
                    .then(res=>{
                        if (res.data.statu===0) {
                            this.$toast({
                                type:'success',
                                message:'修改密码成功'
                            })
                            this.changePas = false
                            this.isEnter = false
                        }else{
                            this.$toast({
                                type:'fail',
                                message:'修改密码失败,请重试'
                            })
                            this.isEnter = false
                        }
                    })
                    .catch(err=>{
                        this.$toast({
                            type:'fail',
                            message:'修改密码失败,请重试'
                        })
                        this.isEnter = false
                    })

                // this.isEnter = false
            },
            //弹出提示框
            wechatShow(){
                this.$dialog.alert({
                    message: '现阶段买卖双方只能通过，卖方给予的微信号联系，后期将会推出交流平台。如带来不便敬请谅解'
                }).then(() => {
                    this.showWechat = true;
                });
            },
            //微信名
            checkWechat(){
                //首先去空格
                this.temporaryWechat = this.temporaryWechat.trim();
                // console.log(this.temporaryWechat)
                this.isEnter = true
                //发送请求
                this.$axios.post('/api/users/checkWechat',{
                    username:this.username,
                    wechat:this.temporaryWechat
                })
                    .then(res=>{
                        if (res.data.statu===0) {
                            this.$toast({
                                type:'success',
                                message:'修改微信号成功'
                            })
                            this.showWechat = false
                            this.Wechat = this.temporaryWechat
                            this.isEnter = false
                        }else{
                            this.$toast({
                                type:'fail',
                                message:'微信号已被注册,请重试'
                            })
                            this.isEnter = false
                        }
                    })
                    .catch(err=>{
                        this.$toast({
                            type:'fail',
                            message:'修改微信号失败,请重试'
                        })
                        this.isEnter = false
                    })
                //
            },
            //wx
            getInfoWx(){
               let username = localStorage.userInfo;
                this.$axios.post('/api/users/getInfoWx',{
                    username:username
                })
                    .then(res=>{
                        if(res.data.statu===-1){
                            this.checkTost()
                        }
                        if (res.data.statu!==1){
                          let i =  dataTool.Decrypt(res.data.msg.Wechat)
                            this.Wechat = i
                        } else{
                            this.Wechat = ''
                        }
                    })
            },
            //tel
            getInfoTel(){
             let  username = localStorage.userInfo;
                this.$axios.post('/api/users/getInfoTel',{
                    username:username
                })
                    .then(res=>{
                        if(res.data.statu===-1){
                            this.checkTost()
                        }
                        if (res.data.statu!==1){
                            this.tel = dataTool.Decrypt(res.data.msg.tel)
                        } else{
                            this.tel = ''
                        }
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
        }
    }
</script>

<style scoped>
    .img-show{
        width: 3rem;
        height: 3rem;
        position: absolute;
        z-index: 3;
        float: right;
        margin-left: 2.3rem;
    }
    .img-show img{
        border-radius: 40px;
    }
    .img-add{
        float: right;
    }
    .overlay{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 200;
    }
    .tel{
        position: absolute;
        z-index: 9999;
    }
</style>