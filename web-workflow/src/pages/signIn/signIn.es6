/**
 * Created by Administrator on 2015/12/21.
 */

var Vue = require('vue');
Vue.use(require('vue-resource'));

var allField = {
    username: false,
    password: false,
    repassword: false,
    qq: false,
    securityCode: false,
    readme: false
};

function checkAllField(vueObj) {
    for(var field in allField) {
        if(!allField[field]){
            vueObj.allFieldTrue = false;
            return;
        }
    }
    vueObj.allFieldTrue = true;
}

function isTrue(field, vueObj) {
    $('#'+field).css({color: 'green'});
    layer.closeAll('tips');
    allField[field] = true;
    checkAllField(vueObj);
}

function isFalse(msg, field, vueObj) {
    $('#'+field).css({color: 'red'});
    layer.tips(msg, '#'+field, {
        tips: [1, '#3595CC'],
        time: 0
    });
    allField[field] = false;
    checkAllField(vueObj);
}

new Vue({
    el: '#login',
    data:{
        username: '',
        password: '',
        repassword: '',
        qq: '',
        role: '',
        securityCode: '',
        readme: false,
        allFieldTrue: false
    },
    methods: {
        changeImg: function() {
            $('.getSecurityCode').get(0).src = '/securityImg?' + new Date().getTime();
        },
        closeTips: function() {
            layer.closeAll('tips');
        },
        checkUsername: function(val) {
            var that = this;
            var username = val.replace(/(^\s*)|(\s*$)/g, "");
            if(username !== ''){
                this.$http.post('/check/username', {
                    username: username
                }).then(function(res) {
                    if(res.data) {
                        isFalse('用户名: ' + username + ' 已经存在！', 'username', that);
                    }else{
                        isTrue('username',that);
                    }
                })
            }else{
                isFalse('用户名不能为空！', 'username', that);
            }
        },
        checkPassword:function(val) {
            if(val === ''){
                isFalse('密码不能为空！', 'password', this);
            }else{
                if(this.repassword !== '' && val !== this.repassword){
                    isFalse('两次输入的密码不一致！', 'password', this);
                }else{
                    isTrue('password', this);
                    isTrue('repassword', this);
                }
            }
        },
        checkRepassword:function(val) {
            if(val === ''){
                isFalse('请再次输入密码！', 'repassword', this);
                return;
            }
            if(val !== this.password){
                isFalse('两次输入的密码不一致！', 'repassword', this);
            }else{
                isTrue('repassword', this);
                isTrue('password', this);
            }
        },
        checkQQ:function(val) {
            if(/^[0-9]*[1-9][0-9]*$/.test(val) && 5 <= val.length && val.length <= 13){
                isTrue('qq', this);
            }else{
                isFalse('请输入5 - 13位的合法ＱＱ号！', 'qq', this);
            }
        },
        checkSecurityCode:function(val) {
            var that = this;
            if(val !== ''){
                this.$http.post('/check/securityCode', {
                    securityCode: val
                }).then(function(res) {
                    if(res.data) {
                        isTrue('securityCode', that);
                    }else{
                        isFalse('验证码错误，请重新输入！', 'securityCode', that);
                    }
                })
            }else{
                isFalse('请输入验证码！', 'securityCode', that);
            }
        },
        checkReadMe:function(val) {
            if(val){
                isTrue('readme', this);
            }else{
                isFalse('请阅读并同意《用户注册协议》！', 'readme', this);
            }
        },
        onSignIn: function() {  //使用es6语法,获取不到相应的数据,例如this.username,得不到数据.
            this.$http.post('/sign/in', {
                invitation: location.search.split('=')[1],
                username: this.username,
                password: this.password,
                repassword: this.repassword,
                qq: this.qq,
                role: this.role,
                securityCode: this.securityCode
            }).then((res) => {
                if(res.data.isOK) {
                    location.href = res.data.path;
                }else{
                    layer.msg(res.data.message);
                }
            });
        }
    }
});
