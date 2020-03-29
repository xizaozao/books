<template>
   <div class="goback" v-if="showGoTop" v-on:scroll.passive="onScroll">
       <img src="../../assets/img/goback.png" width="100%" height="100%" @click="goTop" >
   </div>
</template>

<script>
    export default {
        name:'go-back',
        data(){
            return{
                height:0 ,//可视高度
                showGoTop:false, //初始化隐藏
                scrollTop:0 //初始化高度
            }
        },
        mounted () {
            //增加监听事件
            window.addEventListener('scroll', this.scrollToTop)
        },
        destroyed () {
            window.removeEventListener('scroll', this.scrollToTop)
        },
        methods:{
            scrollToTop:function () {
               let i = document.documentElement.scrollTop || document.body.scrollTop;
               this.scrollTop = i;
               if (this.scrollTop>0){
                   this.showGoTop = true;
               } else {
                   this.showGoTop = false;
               }
            },
            goTop(){
                this.scrollTop =0;
                //点击后返回顶部
                document.documentElement.scrollTop = document.body.scrollTop = this.scrollTop


            }
        }
    }
</script>

<style scoped>
.goback{
    width: 50px;
    height: 50px;
    position: fixed;
    border-radius: 40px;
    z-index: 2;
    margin-top: 110%;
    margin-left: 85%;
    opacity: 0.8;

}
    .goback:hover{
        background-color: ghostwhite;
        opacity: 1;
    }


</style>