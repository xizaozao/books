<template>
    <div class="index">
        <van-nav-bar
                title="首页"
        />
        <span class="index-title">今日推荐°</span>

        <div v-if="swiperData.length>1">
            <swiper :options="swiperOption" ref="mySwiper" class="swiper-box" >
                <!-- slides -->
                <swiper-slide class="swiper-dec" v-for="goodInfo in swiperData" :key="goodInfo.goodsId" >
                    <router-link :to="{path:'/goodsdetail/'+goodInfo.goodsId}">
                        <img :src="goodInfo.imgadd[0]" width="100%" height="100%">
                        <div class="goodsinfo">
                            <p>{{goodInfo.goodsName}}</p>
                            <p>现价:{{goodInfo.goodsPrice}}元</p>
                        </div>
                    </router-link>
                </swiper-slide>
            </swiper>
        </div>
        <!--<div style="height: 10rem;">-->
            <span class="index-title-span">最近更新</span>
        <!--</router-link>-->
        <div class="newest">
            <vue-waterfall-easy ref="waterfall" :imgsArr="imgsArr" @scrollReachBottom="getData" :isRouterLink="true" style="margin-top: 1rem;" :height="waterHeight"  class="waterfallPage">
               <div class="img-info" slot-scope="props">
                   <p class="some-info">{{props.value.info}}</p>
                   <p class="some-info-price">{{props.value.price}}元</p>
               </div>
            </vue-waterfall-easy>
        </div>
      <!--</div>-->
    </div>
</template>

<script>
    import vueWaterfallEasy from 'vue-waterfall-easy'
    import dataTool from '../../dataTool'
    export default {
        components: {
            vueWaterfallEasy
        },
        data() {
            return {
                value: '',
                page:1,
                swiperOption: {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                    centeredSlides:true,
                    loop: true,
                    pagination:{
                        el:'.swiper-pagination',
                        clickable:true
                    }
                },
                imgsArr:[],
                swiperData:[],
                IsTREU:true,
                num: 80,
                waterHeight:500 //初始值


            }
        },
        computed: {
            swiper() {
                return this.$refs.mySwiper.swiper
            }
        },
        mounted() {
            if(this.swiperData.length>1){
                this.swiper.slideTo(0, 1000, false)
            }
        },
        methods:{
            getData(){
                this.$axios.get('/api/goods/productionsNewest',{
                    params:{
                        page:this.page
                    }
                })
                    .then(res=>{
                        if(res.data.msg.length>0) {
                                //两个都赋值
                                var d = []

                                d = dataTool.getData(res.data.msg)
                                for (let i = 0; i < res.data.msg.length; i++) {
                                    //瀑布流加载数据
                                    res.data.msg[i].imgadd = d[i]
                                    let obj = {
                                        src: res.data.msg[i].imgadd,
                                        href: 'goodsdetail/' + res.data.msg[i].goodsId,
                                        info: res.data.msg[i].goodsName,
                                        price: res.data.msg[i].goodsPrice
                                    }
                                    this.imgsArr.push(obj)
                                    this.imgsArr.forEach(val => {
                                        if (val.src.length > 1) {
                                            val.src.splice(1, val.src.length)
                                        }
                                    })
                                    obj = {}
                                }
                                let pageheight = document.documentElement.clientHeight||document.body.clientHeight
                                this.waterHeight = pageheight;
                            this.page++

                        }else{
                                //没有数据了
                                this.$refs.waterfall.waterfallOver()
                            console.log(this.swiperData)
                                return false;
                            }


                    })
                    .catch(err=>{
                        console.log(err)
                    })
            },
            //拿到轮播图
            getbannerPicArray(){
                this.$axios.get('/api/goods/getAll')
                    .then(response=>{
                        // response.data.msg =  dataTool.Decrypt(response.data.msg)
                        if(response.data.statu===0){
                            //请求数据
                            var d = []
                            d = dataTool.getData(response.data.msg)
                            for (let i = 0; i < response.data.msg.length; i++) {
                                response.data.msg[i].imgadd = d[i]
                                if (response.data.msg[i].imgadd.length>1) {
                                    response.data.msg[i].imgadd.splice(1,response.data.msg[i].imgadd.length)
                                }
                            }
                            this.swiperData = response.data.msg
                        }
                    })
                    .catch(error=>{
                        console.log(error)
                    })
            }
        },
        created(){
            this.getData()
            this.getbannerPicArray()
        }

    }
</script>

<style scoped>
    .index-title-span{
        display: block;
        width: 5rem;
        padding: 0.5rem;
        height: 1rem;
        line-height: 1rem;
        text-align: center;
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        font-size: 18px;
        background-color: rgb(161,145,78);
        margin-left: 7.5rem;
        color: white;
        margin-top: 15px;
    }
    .index .index-title{
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        font-size: 18px;
        margin-left: 15px;
        border-bottom: rgb(161,145,78) solid;
    }
    .swiper-box{
        margin-top: 0.8rem;
        margin-bottom: 0.5rem;
    }
    body {
        background: rgba(220, 220, 220, .5);
    }

    i {
        display: block;
    }
    a {
        text-decoration: none;
    }
    .index{
        height: 15rem;
        width: 100%;
    }
    .swiper-dec img{
        width: 80%;
        height: 70%;
        margin-left: 10%;
        background-color:rgb(248,248,248);
    }
    .swiper-dec .goodsinfo{
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        display: flex;
        flex-wrap: wrap;
        font-size: 14px;
        color: #000;
    }
    .goodsinfo p:nth-child(1){
        width: 100%;
        height: 4.8rem;
    }
    .goodsinfo p:nth-child(2){
        color: rgb(161,145,78);
        margin-top: 0.5rem;
        font-size: 18px;
    }
   .newest{
      width: 100%;
      /*height: 500px;*/
      margin-bottom: 60px;
       /*position: relative;*/
       /*overflow: hidden;*/
}
    .img-info{
        height: 5rem;
        margin-bottom: 5px !important;
    }
    .some-info{
        font-size: 1rem;
        text-decoration: none;
        color: #222222;
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }
    .some-info-price{
        color: red;
        font-size: 14px;
        text-decoration: none;
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
    }
</style>