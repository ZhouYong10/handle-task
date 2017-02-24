/**
 * Created by Administrator on 2015/12/21.
 */

var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));

new Vue({
    el: '#login',
    data:{
        username: '',
        password: '',
        repassword: '',
        qq: '',
        role: '',
        securityCode: ''
    },
    methods: {
        changeImg: function() {
            $('.getSecurityCode').get(0).src = '/securityImg?' + new Date().getTime();
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
    },
    validators: {
        samepassword: function(val) {
            console.log(val == this.password);
            return val == this.password;
        }
    }
});
