<template>
    <div>
        <nav-bar title="分类"></nav-bar>
        <form action="/">
            <van-search
                    v-model="value"
                    placeholder="请输入搜索关键词"
                    show-action
                    @search="onSearch"
                    @cancel="onCancel"
                    @input="input"
                    @focus="focus"
                    @blur="blur"
            />
        </form>
        <div class="goodsmsg" v-if="isSearch">
            <dl>
                <dt>全部分类</dt>
                <dd v-for="(item,index) in searchList" @click="search(index)" :key="index">{{item}}</dd>
            </dl>
        </div>
            <div class="classify" v-if="showClassify" >

                 <div v-for="(item,index) in classify" @click="onSearchBytitle(item.title)">
                     <img :src="item.url" alt="" width="100%" height="100%">
                     <p>{{item.title}}</p>
                 </div>
                 <p class="classify-else"  @click="onSearchBytitle('其他')" >°其他°</p>
            </div>

        <!--根据搜索内容展示商品列表-->
        <div class="goodslist">
            <van-list v-model="loading" :finished="isfinshed" finished-text="没有更多数据了" @load="LoadByPage">
            <ul>
                <li v-for="good in goods" :key="good.id">
                    <router-link :to="{name:'goodsdetail',params:{id:good.goodsId}}">
                        <div class="goodsimg">
                            <img :src="good.imgadd[0]" width="100%" height="100%">
                        </div>
                        <div class="desc">
                            <div class="title">{{good.goodsName}}
                            </div>
                        </div>
                        <div class="goodsinfo">
                            <div class="goodsprice">￥{{good.goodsPrice}}</div>
                            <div class="posttime">发布时间:{{good.createTime|relTime}}</div>
                        </div>
                    </router-link>
                </li>
            </ul>
            </van-list>
        </div>

        <div class="searchNull" v-if="showNull">
            <div class="searchNull-img">
                <img src="../../assets/img/seachNull.png" width="100%" height="100%">
            </div>
            <p class="searchNull-info">暂时没有该分类的商品喔~</p>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import dataTool from '../../dataTool'
    export default {
        data() {
            return {
                value: '',
                isFocus: false,
                searchList: [],
                page: 1,
                goods:[],
                loading:false, //
                isfinshed:false, //是否加载完成,
                showClassify:true,
                classify:[
                    {title:'书类',url:require('../../assets/img/books.png')},
                    {title:'代步',url:require('../../assets/img/transportation.png')},
                    {title:'食物',url:require('../../assets/img/foods.png')},
                    {title:'娱乐',url:require('../../assets/img/recreation.png')},
                    {title:'运动',url:require('../../assets/img/running.png')},
                    {title:'电器',url:require('../../assets/img/electric.png')},
                ],
                showNull:false
            }
        },
        methods: {
            onSearch() {
                //初始化页数
                this.page=1
                let user = localStorage.userInfo||''
                this.searchFirst(this.value, this.page ,user)
                    .then(res=>{
                        let arr = Object.keys(res.data.msg )
                        if (arr.length===0){
                            this.showNull = true;
                            this.showClassify = false;
                            return false;
                        }
                        // res.data.msg = dataTool.Decrypt(res.data.msg)
                        let d=[]
                        d = dataTool.getData(res.data.msg)
                        for (let i=0;i<res.data.msg.length;i++) {
                            res.data.msg[i].imgadd=d[i]
                        }
                        this.goods = res.data.msg;
                        this.page++
                })
                    .catch(e=>{
                        console.log(e)
                    })

            },
            focus: function () {
                this.isFocus = true
            },
            blur: function () {
                let self = this;
                setTimeout(function () {
                    self.isFocus = false
                }, 200)
            },
            input: _.debounce(function () {
                //输如一个字符串都搜索
                // 需要一个延时函数
                this.$axios.get('/api/goods/search', {
                    params: {
                        key: this.value
                    }
                })
                    .then(res => {
                        this.searchList = res.data.msg
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }, 300),
            search(i) {
                let key = this.searchList[i]
                this.value=key
                let user = localStorage.userInfo||''
                //初始化页数
                this.page=1
                this.searchFirst(key,this.page,user)
                    .then(res=>{
                        let arr = Object.keys(res.data.msg )
                        if (arr.length===0){
                            this.showNull = true;
                            this.showClassify = false;
                            return false;
                        }
                        var d=[]
                        d = dataTool.getData(res.data.msg)
                        for (let i=0;i<res.data.msg.length;i++) {
                            res.data.msg[i].imgadd=d[i]
                        }
                        this.goods = res.data.msg;
                        this.page++
                    })
                    .catch(e1=>{
                        console.log(e1)
                    })
            },
            onSearchBytitle(val){
                let user = localStorage.userInfo||''
                  let key = val;
                  this.page = 1;
                  this.searchFirst(key,this.page,user)
                    .then(res=>{
                        let arr = Object.keys(res.data.msg )
                        if (arr.length===0){
                            this.showNull = true;
                            this.showClassify = false;
                            return false;
                        }
                        var d=[]
                        d = dataTool.getData(res.data.msg)
                        for (let i=0;i<res.data.msg.length;i++) {
                            res.data.msg[i].imgadd=d[i]
                        }
                        this.goods = res.data.msg;
                        this.page++
                        this.showClassify = false
                    })
                    .catch(e1=>{
                        console.log(e1)
                    })
                },
            searchFirst(val, p,user) {
                let key = val
                let page = p
                let username = user
              return new Promise((resolve, reject)=>{
                  this.$axios.get('/api/goods/' +
                      'searchGoods', {
                      params: {
                          key, page,username
                      }
                  })
                      .then(res => {
                         resolve(res)
                      })
                      .catch(e => {
                          reject(e)
                      })
              })
            },
            //加载更多
            LoadByPage(){
                if (this.goods.length!=0){
                    setTimeout(()=>{
                        let key = this.value
                        this.$axios.get('/api/goods/' +
                            'searchGoods', {
                            params: {
                                key,
                                page:this.page,
                            }
                        })
                            .then(res=>{
                                // res.data.msg = dataTool.Decrypt(res.data.msg)
                                if (res.data.msg.length!==0){
                                    var d=[]
                                    d = dataTool.getData(res.data.msg)
                                    for (let i=0;i<res.data.msg.length;i++) {
                                        res.data.msg[i].imgadd=d[i]
                                    }
                                    //数据拼接
                                    this.goods=this.goods.concat(res.data.msg)
                                    this.page++
                                    this.loading=false
                                    this.isfinshed=false
                                }else {
                                    this.loading=false
                                    this.isfinshed = true;
                                }

                            })
                            .catch(e2=>{
                                console.log(e2)
                            })
                    },500)
                }else{
                    this.loading=false
                    return;

                }
                    // 发请求

            },
            onCancel(){
                this.$router.go(-1);
            }
        },
            computed: {
                ishostGoods: function () {
                    return !this.isFocus && !this.value
                },
                isSearch: function () {
                    return this.isFocus && this.value
                }
            }

    }
</script>

<style scoped>
    .searchNull{
         margin-left: 6rem;
        margin-top: 7rem;
    }
    .searchNull-img{
        width: 8rem;
        height: 8rem;
    }
    .searchNull-info{
        font-size: 14px;
        color:rgb(161,145,78);
    }
     .classify{
         width: 100%;
         margin-left: 0.2rem;
         display: flex;
         font-size: 14px;
         flex-direction: row;
         flex-wrap: wrap;
         margin-top:6rem;
     }

     .classify div{
        width:5.3rem;
         padding: .3rem;
         font-size: 12px;
         text-align: center;
         flex: auto;
     }
     .classify div img{
         width: 50px;
         height: 50px;
     }
     .classify div p{
        color:rgb(161,145,78);
     }
     .classify .classify-else{
         text-align: center;
         font-size: 2rem;
         color:rgb(161,145,78) ;
         margin: 0 auto;
     }
    .goodsmsg{
        width: 100%;
        background-color: white;
        position: absolute;
        z-index: 2;
        padding: 10px;
        font-size: 12px;
        box-sizing: border-box;
        border: 1px solid #E5E5E5;
        box-shadow: 0 3px 5px 0 rgba(0, 0, 0, .1);
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        border-top: none;
    }
    .goodsmsg dt{
        font-size: 0.7rem;
        border-bottom:0.05rem silver solid ;
        color: #999;
        font-weight: bold;
    }
    .goodsmsg dd{
        font-size: 0.6rem;
        border-bottom: 1px silver solid;
        color: #666;

    }
    .goodslist{
        margin-bottom: 60px;
        position: absolute;
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
         margin-left: 5px;
         width: 6.2rem;
         height: 110px;
         float: left;
         padding: 5px;

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
     .goodsprice{
         width: 4.5rem;
         float: left;
         color: red;
         font-size: 1rem;
     }
     .posttime{
         float: left;
         width: 7rem;
         color: darkgrey;
         font-size: 13px;
         text-align: center;
     }
</style>