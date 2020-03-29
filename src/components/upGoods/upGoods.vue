<template>
    <div class="teml">
        <nav-bar title="发布置换"></nav-bar>
        <!--商品信息填写-->
        <van-cell-group>
            <van-field
                    v-model="goodsName"
                    label="商品信息"
                    right-icon="question-o"
                    placeholder="请输入商品信息"
                    @click-right-icon="$toast('简要概括商品的信息，不超过30字哦')"
                    :error-message="errGoodsName"
                    @focus="clearErr"
                    @blur="checkGoodsName"
            />
            <van-field
                    v-model="goodsNum"
                    type="number"
                    label="商品数量"
                    placeholder="请输入商品数量"
            />
            <van-field
                    v-model="goodsPrice"
                    type="number"
                    label="商品价格"
                    placeholder="请输入商品价格"
            />
            <van-field
                    v-model="goodsdetails"
                    label="详细信息"
                    type="textarea"
                    placeholder="请输入商品详细信息"
                    rows="3"
                    autosize
            />
            <van-field
                    v-model="goodsNew"
                    label="新旧程度(成)"
                    type="text"
                    placeholder="几成新"
            />
            <van-row style="border-bottom: 1px solid #ebedf0">
                <van-col :span="8" style="font-size: 14px;line-height: 14px;padding: 10px 15px;text-align: center">商品分类</van-col>
                <van-col :span="14">
                    <select name="selected" v-model="selected" style="height:1rem;-webkit-appearance:none;appearance:none;border:none;font-size:14px;padding:0px 10px;display:block;width:100%;-webkit-box-sizing:border-box;box-sizing:border-box;background-color: #FFFFFF;color:#333333;border-radius:4px; ">
                    <option value="">请选择</option>
                    <option value="书类">书类</option>
                    <option value="代步">代步</option>
                    <option value="食物">食物</option>
                    <option value="娱乐">娱乐</option>
                    <option value="运动">运动</option>
                    <option value="电器">电器</option>
                    <option value="其他">其他</option>
                </select>
                </van-col>
            </van-row>

            <van-field
                    v-model="goodsType"
                    label="商品关键字"
                    type="text"
                    placeholder="输入搜索关键字"
            />
            <van-field
                      v-model="goodsTime"
                      label = "商品购买时间"
                      placeholder="请选择时间"
                      @click="ShowTime"
            ></van-field>

        </van-cell-group>
        <van-popup v-model="show" position="bottom"><van-datetime-picker
                v-model="currentDate"
                type="year-month"
                :max-date="maxDate"
                @confirm="confirm"
        /></van-popup>
        <van-row>
            <van-col span="32" style="font-size: 13px;color: #999999">展示图片,默认第一张图片为首页</van-col>
        </van-row>
        <!--上传图片-->
        <div class="upload">
            <div class="showImg" v-for="(img,index) in firstImg" @touchstart="showIcon" @touchend="clearLoor">
                <!--长按删除-->
                <div class="img-icon" @click="delImg(index)" v-show="iconShow">
                    <van-icon name="cross"></van-icon>
                </div>
                <!--展示图片-->
                <img :src="img" alt="" class="img-add" >
            </div>
            <div class="upImg" v-show="isAdding">
                <van-uploader :after-read="onRead">
                    <img src="@/assets/img/img-add.png" alt="" class="img-add">
                </van-uploader>
            </div>
        </div>
        <van-button size="large"  type="danger" @click="upData"  class="btn">立即提交</van-button>

    </div>


</template>

<script>
    import obj from "../../dataTool";

    export default {
        created(){
            //先判断是否有登录
            if(localStorage.userInfo){
                this.username = localStorage.userInfo;
                // console.log(localStorage.getItem('userInfo'))
            }else{
                this.checkTost()
                return ;
            } 
        },
        data(){
            return{
                goodsName:this.$route.params.goods && this.$route.params.goods.goodsName || '',
                goodsPrice:this.$route.params.goods && this.$route.params.goods.goodsPrice || '',
                goodsNum:this.$route.params.goods && this.$route.params.goods.goodsNum || '',
                goodsdetails:this.$route.params.goods && this.$route.params.goods.goodsDetails || '',
                goodsNew:this.$route.params.goods && this.$route.params.goods.goodsNew || '',
                goodsTime:this.$route.params.goods && this.$route.params.goods.goodsTime || '',
                goodsType:this.$route.params.goods && this.$route.params.goods.goodsType || '',
                currentDate:new Date(),
                // minDate: new Date(),
                maxDate:new Date(),
                firstImg:this.$route.params.goods && this.$route.params.goods.imgadd || [], //展示图片
                iconShow:false, //长按后才显示
                IsLoading:false,
                show:false,
                selected:'',
                errGoodsName: ''
            }
        },
        methods:{
           async onRead(file){
                //将东西储存到数组中
                //先判断图片大小 如果大于2M就压缩
               let size = obj.getImgSize(file.content)
                if (size>1500){
                     let i = await obj.compressImg(file.content).
                    this.firstImg.push(i);
                } else{
                    this.firstImg.push(file.content)
               }
            },
            //长按删除图片
            delImg(index){
                //删除图片
                this.firstImg.splice(index,1);
            },
            //触摸一秒后弹出icon
            showIcon(){
                clearInterval(this.loor) //再次清除定时器
                this.loor = setInterval(()=>{
                     this.iconShow = true
                },1000)
            },
            //两秒后删除定时器
            clearLoor(){
                clearInterval(this.loor)
            },
            upData(){
                this.IsLoading = true
                //先检查是否为空恶意提交
                if(this.goodsName===''||this.goodsPrice===''||this.goodsNum ===''||this.goodsdetails===''||this.firstImg.length===0||this.selected===''||this.errGoodsName!=='')
                {
                    this.$toast({
                        type:'fail',
                        message:'上面全是必选项哦。请填写完整商品信息'
                    })
                    this.IsLoading = false
                    return;
                }
                this.$axios.post('/api/goods/upGoods',{
                    goodsImg:this.firstImg,
                    username:this.username,
                    goodsName:this.goodsName,
                    goodsPrice:this.goodsPrice,
                    goodsNum:this.goodsNum,
                    goodsdetails:this.goodsdetails,
                    goodsTime:this.goodsTime,
                    goodsNew:this.goodsNew,
                    goodsclassify:this.selected,
                    goodsType:this.goodsType
                })
                    .then(res=>{
                        if(res.data.statu!==-1){
                            if (res.data.statu===0) {
                                this.$toast({
                                    type:'success',
                                    message:res.data.msg
                                })
                                //发布正确后 全部清空
                                this.goodsName=''
                                this.goodsPrice=''
                                this.goodsNum =''
                                this.goodsdetails=''
                                this.firstImg=[]
                                this.goodsTime = ''
                                this.goodsNew = ''
                                this.goodsType=''
                                this.selected=''
                            }else {
                                this.$toast({
                                    type:'fail',
                                    message:res.data.msg
                                })
                            }
                            this.IsLoading = false
                        }else{
                            this.checkTost()
                        }

                    })
                    .catch(err=>{
                        this.$toast({
                            type:'fail',
                            message:'出错了，请重试'
                        })
                        this.IsLoading = false
                    // :loading="IsLoading"
                    })
            },
            ShowTime(){
              this.show = true;
            },
            confirm(val){
                // 首先格式化时间格式
                var month = val.getMonth()+1;
                if(month<10){ month = '0'+month}
                var year = val.getFullYear();
                this.goodsTime = year+'-'+month;
                this.show = false
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
            },
            clearErr(){
               this.errGoodsName = ''
            },
            checkGoodsName(){
               if (this.goodsName.length>31){
                   this.errGoodsName = '请输入不超过30的商品名'
               }
            }

        },
        computed:{
            isAdding(){
                if(this.firstImg.length>4){
                    return false
                }else {
                    return true
                }
            }
        }
    }
</script>

<style scoped>
    .teml{
        margin-bottom: 85px;
    }
    .img-icon{
        width: 18px;
        height: 18px;
        font-size: 15px;
        position: absolute;
        z-index: 2;
        color: white;
        border-radius: 100%;
        background-color: red;
        right: 0.1px;
        top: -5px;
    }
    .upload{
        display: flex;
        flex-wrap: wrap;
    }
    .showImg{
        width: 31%;
        height: 100px;
        margin-left: 1.5px;
        margin-bottom: 5px;
        margin-right: 5px;
        /*border-radius: 15px;*/
        position: relative;

    }
    .upImg{
        width: 32%;
        height: 100px;
        border: #999999 solid 1px;
        border-radius: 25px;
    }
    .img-add{
        width: 100%;
        height: 90px;
        margin-right: 10px;
        margin-bottom: 12px;
        border-radius: 15px;
    }
    .btn{
        margin-top: 10px;
    }
</style>