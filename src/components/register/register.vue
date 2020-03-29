<template>
    <div class="teml">
        <!--logo-->
        <!--<div class="logo"></div>-->
        <!--登录注册info-->
        <div class="title">
            <span class="font login" @click="Onlogin">登录</span>
            <span class="font register" @click="Onregister">注册</span>
        </div>
        <div class="login-info" v-if="login">
            <van-cell-group class="login-msg">
                <van-field
                        v-model="username"
                        clearable
                        left-icon="manager"
                        right-icon="question-o"
                        placeholder="请输入用户名"
                        @click-right-icon="$toast('请输入用户名')"
                        class="login-fild"
                />
                <van-field
                        v-model="password"
                        type="password"
                        left-icon="eye"
                        placeholder="请输入密码"
                        class="login-fild"
                />
            </van-cell-group>
            <van-button round plain type="primary" size="small" @click="check" class="btn-pos">登录</van-button>
        </div>
        <div class="info-img" v-if="login">
            <img src="@/assets/img/login.jpg" width="100%" height="100%">
        </div>
        <div class="register-img" v-if="register">
            <img src="@/assets/img/register.jpg" width="100%" height="100%">
        </div>
        <div class="register-info" v-if="register">
            <van-cell-group class="register-msg">
                <van-field
                        v-model="Resuser"
                        clearable
                        left-icon="manager"
                        right-icon="question-o"
                        placeholder="请输入用户名"
                        @click-right-icon="$toast('支持中文和符号，空格除外，长度小于6')"
                        @blur="checkUsername"
                        @focus="clearUsermsg"
                        :error-message="this.errUsermsg"
                        class="desction-field"
                />
                <van-field
                        v-model="Respas"
                        type="password"
                        left-icon="eye"
                        placeholder="请输入8位密码"
                        @blur="checkPas"
                        @focus="clearPasmsg"
                        :error-message="this.errPasmsg"
                />
                <!-- <van-field
                        v-model="email"
                        label="邮箱"
                        placeholder="请输入邮箱"
                        :error-message="this.errmsg"
                        @blur="checkEmil"
                        @focus="clearmsg"
                />
                <van-field
                        v-model="sms"
                        center
                        clearable
                        label="邮件验证码"
                        placeholder="请输入邮件验证码"
                >
                    <van-button slot="button" size="small" type="primary" @click="sentCode">{{count}}</van-button>
                </van-field> -->
            </van-cell-group>
            <van-button round plain type="primary" size="small" @click="registerGo" class="btn-pos1" :loading="openLoading">注册</van-button>
        </div>

    </div>
</template>
<script>
    import CryptoJs from 'crypto-js'
    import dataTool from '../../dataTool'
    export default {
        mounted(){
            if (this.login) {
                let y = document.getElementsByClassName('login-info')[0].offsetHeight
                let w = document.getElementsByClassName('login-info')[0].offsetWidth
                let t = document.getElementsByClassName('login-msg')[0].offsetHeight
                let btn = document.getElementsByClassName('btn-pos')[0]

                //屏幕宽度
                let pW = document.documentElement.offsetWidth||document.body.offsetWidth

                btn.style.marginTop=y-t-30+'px'
                btn.style.marginLeft=pW/2-15-pW*0.1+'px'
            }

        },
        updated(){
            if (this.login) {
                let y = document.getElementsByClassName('login-info')[0].offsetHeight
                let w = document.getElementsByClassName('login-info')[0].offsetWidth
                let t = document.getElementsByClassName('login-msg')[0].offsetHeight
                let btn = document.getElementsByClassName('btn-pos')[0]
                let yy = document.getElementsByClassName('login-fild')[0].style.marginTop
                //屏幕宽度
                let pW = document.documentElement.offsetWidth||document.body.offsetWidth
                console.log(yy)
                btn.style.marginTop=y-t-30+yy+'px'
                btn.style.marginLeft=pW/2-15-pW*0.1+'px'
            }
            if(this.register){
                let y = document.getElementsByClassName('register-info')[0].offsetHeight
                let w = document.getElementsByClassName('register-info')[0].offsetWidth
                let t =  document.getElementsByClassName('register-msg')[0].offsetHeight
                let btn = document.getElementsByClassName('btn-pos1')[0]
                let pW = document.documentElement.offsetWidth||document.body.offsetWidth
                btn.style.marginTop=y-t-30+'px'
                btn.style.marginLeft=pW/2-15-pW*0.1+'px'

            }
        },
        data(){
            return{
                username:'',//用户名
                password:'',//密码
                login:true,
                register:false,
                Resuser:'',//注册用户名
                Respas:'' ,// 注册密码
                openLoading:false, //防止多次点击
                sms:'', //验证码
                errmsg:'',
                email:'',
                errUsermsg:'',
                errPasmsg:'',
                count:'发送验证码',
                textbtn:true
            }
        },
        methods:{
            check(){
                //发送请求
                this.$axios.post('/api/users/signin',{
                    username:this.username,
                    password:CryptoJs.MD5(this.password).toString()
                })
                    .then(respon=>{
                        let res = respon.data
                        console.log('res', res)
                        if(res.statu===1){
                            this.$toast({
                                type:'fail',
                                mask: true,
                                message: '检查用户名密码',
                                duration:1500
                            });
                        }else {
                            //保存到本地locStore
                            new Promise((resolve, reject)=>{
                                //保存本地
                               localStorage.setItem('userInfo',this.username)
                               resolve()
                            }).then(()=>{
                                //保存成功 提示
                                this.$toast({
                                    type: 'success',
                                    mask: true,
                                    message: res.msg,
                                    duration:1500
                                });
                                //去到个人中心
                                this.$router.push({
                                    path:'/mine'
                                })
                            })
                                .catch(err =>{
                                    this.$toast({
                                        type:'fail',
                                        mask: true,
                                        message: '登录失败',
                                        duration:1500
                                    })
                                })
                        }
                    })
                    .catch(err=>{
                        console.log(err,'登录失败');
                        this.openLoading=false
                    })
            },
            Onlogin(){
                this.login = true;
                this.register = false;
            },
            Onregister(){
                this.login = false;
                this.register = true;
            },
            registerGo(){
                //加载状态
                this.openLoading = true;
                console.log('111')
                this.$axios.post('/api/users/register',{
                    username:this.Resuser,
                    pas:CryptoJs.MD5(this.Respas).toString(),
                    code:this.sms,
                    email:this.email
                }).then(respon=>{
                    if(respon.data.statu!==1){
                        let res = respon.data
                        this.$toast({
                            mask: true,
                            message: '终于等到你'+res.msg,
                            duration:1500
                        });
                        this.Onlogin();
                        this.openLoading=false
                    }else{
                        this.$toast({
                            type:'fail',
                            message: respon.data.msg,
                            duration:1500
                        });
                        this.openLoading=false
                    }

                })
                    .catch(err=>{
                        console.log(err)
                        this.openLoading=false
                    })
            },
            //发送验证码
            sentCode(){
                   this.$axios.post('/api/users/verify',{
                       email:this.email,
                       username:this.Resuser
                   })
                       .then(res=>{
                           if(res.data.statu===0){
                               this.count = 60
                               let i = setInterval(()=>{
                                   this.count--
                                   if (this.count===0){
                                       clearInterval(i)
                                       this.count = '发送验证码'
                                   }
                               },1000)
                               this.$toast({
                                   mask: true,
                                   message: res.data.msg,
                                   duration:1500
                               });
                           }else{
                               this.$toast({
                                   type:'fail',
                                   message: res.data.msg,
                                   duration:1500
                               });
                           }

                       })
                       .catch(e=>{
                           console.log(e)
                       })
            },
            //验证是否是正确的邮箱
            checkEmil(){
                //先判断是否符合正则
               if(this.email!==''){
                   if(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(this.email)){
                       //发请求看是否可用
                       this.$axios.post('/api/users/checkEmail',{
                           email:this.email
                       })
                           .then(res=>{
                               console.log(res.data)
                               if(res.data.statu!==-1){
                                   if ( res.data.statu!==0) {
                                       this.errmsg = '该邮箱已经被注册。'
                                       this.openLoading =true
                                   }
                               }else{
                                   this.$toast({
                                       mask: true,
                                       message: res.data.msg,
                                       duration:1500
                                   });

                               }

                           })
                   }else{
                       this.errmsg='邮箱格式不正确,请检查'
                       this.openLoading =true
                   }
               }

            },
            clearmsg(){
                this.errmsg=''
            },
            clearUsermsg(){
              this.errUsermsg=''
                this.openLoading = true
            },
            clearPasmsg(){
                this.errPasmsg=''
                this.openLoading = false
            },
            checkUsername(){
                if(this.Resuser.trim().length<6){
                    //发请求看是否可用
                    this.$axios.post('/api/users/checkUsername',{
                        user:this.Resuser
                    })
                        .then(res=>{
                            if(res.data.statu!==-1){
                                if ( res.data.statu!==0) {
                                    this.errUsermsg = '该用户名已经被注册。'
                                }
                            }else{
                                this.$toast({
                                    mask: true,
                                    message: res.data.msg,
                                    duration:1500
                                });

                            }

                        })
                }else{
                    this.errUsermsg = '支持中文和符号，空格除外，长度小于6'
                    this.openLoading = true
                }
              },
            checkPas(){
                if (this.Respas.trim().length<9||this.Respas.trim().length>16) {
                    this.errPasmsg = '请输入不少于8位不大于16位的密码'
                    this.openLoading =true
                }
            }

            },



        }
    
</script>
<style scoped>
    ul{
         margin-top: 15%;
          overflow: hidden;
    }
    ul li{
        float: left;
        list-style: none;
        margin-top: 20px;
    }
    .teml{
        height: 100%;
        /*background-image: url("../../assets/img/reginster.png");*/
    }
    .title{
        width: 100%;
        position: absolute;
        z-index: 2;
        margin-top: 15%;
    }
    .font{
        font-size: 1rem;
        color: darkgray;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }
    .login{
        float: left;
        margin-left: 0.3rem;
    }
    .register{
        float: right;
        margin-right: 10%;
    }
    .info-img {
        position:fixed;
        top: 0;
        left: 0;
        width:100%;
        height:100%;
        z-index:-10;
        zoom: 1;
        background-color: #fff;
        background-repeat: no-repeat;
        background-size: cover;
        -webkit-background-size: cover;
        -o-background-size: cover;
        background-position: center 0;
    }
    .info-img img{
        /*border-radius: 0 35px 35px 0;*/
    }
    .login-info{
        width: 90%;
        height: 8rem;
        background-color: white;
        position: absolute;
        z-index: 3;
        margin-top: 10rem;
        margin-left: 15px;
        border-radius: 35px 35px 35px 35px;
        /* for IE */
        filter:alpha(opacity=70);
        /* CSS3 standard */
        opacity:0.7;
    }
    .btn-pos{
        position: absolute;
        /*z-index: 5;*/
        /*margin-top: 138px;*/
        /*margin-left: 4.5rem;*/
        /*margin-top: 2.3rem;*/
    }
    .btn-pos1{
        position: absolute;
        /*margin-top: 0 !important;*/
        /*margin-left: 0 !important;*/
    }
    .register-img{
        position:fixed;
        top: 0;
        left: 0;
        width:100%;
        height:100%;
        z-index:-10;
        zoom: 1;
        background-color: #fff;
        background-repeat: no-repeat;
        background-size: cover;
        -webkit-background-size: cover;
        -o-background-size: cover;
        background-position: center 0;
    }
    .register-img img{
        /*border-radius: 35px 0 0 35px;*/
    }
    .register-info{
        width: 90%;
        height: 7rem;
        background-color: white;
        position: absolute;
        z-index: 3;
        margin-top: 8rem;
        margin-left: 5%;
        border-radius: 35px 35px 35px 35px;
        /* for IE */
        filter:alpha(opacity=70);
        /* CSS3 standard */
        opacity:0.7;
    }
    .desction-field{
        width: 100%;

    }
    .login-fild{
        /*margin-top: 1.5rem;*/
    }

</style>