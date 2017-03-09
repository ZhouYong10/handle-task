/**
 * Created by Administrator on 2015/12/21.
 */

var Vue = require('vue');
Vue.use(require('vue-resource'));

var allField = {
    username: false,
    password: false,
    securityCode: false
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
        securityCode: '',
        isAutoLogin: false,
        allFieldTrue: false
    },
    created: function() {
        var loginInfo = Cookies.get('loginInfo');
        if(loginInfo) {
            this.$http.post('/login', loginInfo).then((res) => {
                if(res.data.isOK) {
                    location.href = res.data.path;
                }else{
                    layer.msg(res.data.message);
                }
            });
        }
    },
    methods: {
        changeImg: function() {
            $('.getSecurityCode').get(0).src = '/securityImg?' + new Date().getTime();
        },
        closeTips: function() {
            layer.closeAll('tips');
        },
        checkUsername: function(val) {
            var username = val.replace(/(^\s*)|(\s*$)/g, "");
            if(username !== ''){
                isTrue('username',this);
            }else{
                isFalse('用户名不能为空！', 'username', this);
            }
        },
        checkPassword: function(val) {
            if(val === ''){
                isFalse('密码不能为空！', 'password', this);
            }else{
                isTrue('password', this);
            }
        },
        checkSecurityCode: function(val) {
            if(val !== ''){
                isTrue('securityCode', this);
            }else{
                isFalse('请输入验证码！', 'securityCode', this);
            }
        },
        onLogin: function() {  //使用es6语法,获取不到相应的数据,例如this.username,得不到数据.
            if(this.isAutoLogin) {
                Cookies.set('loginInfo', {
                    username: this.username,
                    password: this.password,
                    isAuto: true
                }, {expires: 14, path: '/'});
            }
            this.$http.post('/login', {
                username: this.username,
                password: this.password,
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
