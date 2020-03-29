<template>
    <van-nav-bar  :title="this.title" left-text="返回" left-arrow  @click-left="goback">
        <slot></slot>
    </van-nav-bar>
</template>

<script>
    export default {
        name: 'nav-bar',
        data(){
            return{
                value:'',
            }
        },
        props:{
            title:'',
        },
        methods: {
            goback:function () {
                this.$router.go(-1);
            }
        }
    }
</script>

<style scoped>
</style>