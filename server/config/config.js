module.exports = {
	//配置发送邮件信息
	smtp:{
		host(){
			return 'smtp.qq.com'
		},
		user(){
			return '3316756985@qq.com'
		},
		pass(){
			return '15839493300qqabc'
		},
		//验证码
		code(){
			return Math.random().toString(16).slice(2,6).toUpperCase();
		},
		//过期时间
		expire(){
				return new Date().getTime()+60*1000*5
		}
	}
}