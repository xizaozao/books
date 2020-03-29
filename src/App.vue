<template>
  <div class="all">
      <router-view v-if="isRouterAlive"></router-view>
    <!--底部导航-->
    <van-tabbar v-model="active" active-color="#a1914e" class="tabbar">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="chat-o">搜索</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o">收藏盒</van-tabbar-item>
      <van-tabbar-item icon="friends-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script>
  export default {
      provide(){
          return{
              reload:this.reload
          }
      },
     data(){
         return{
             active:0, // 索引 表示第几个被选中
             goTo:['index','usermsg','shopcar','mine'],
             isRouterAlive:true,
             routerFresh:''
         }
     },
      created(){
          this.changeTabBar()
      },
      methods:{
           reload(){
               this.isRouterAlive = false
               this.$nextTick(()=>{
                   this.isRouterAlive = true
               })
           },
          changeTabBar(){
               this.$toast.clear()
            let that = this
             let y = this.goTo.indexOf(that.$route.name)
              this.active=y
          }
      },
      watch:{
         active:function () {
                 this.$router.push({name: this.goTo[this.active]})

         }
      }
  }
</script>
<style >

  .tabbar{
    z-index: 3;
  }
</style>
