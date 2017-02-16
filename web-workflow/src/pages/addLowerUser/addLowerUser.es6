
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));

new Vue({
    el: '#addLowerUser',
    data: {
        username: '',
        notrepeat: true
    },
    methods: {
        notRepeat: function() {
            var self = this;
            self.$http.post('/user/username/notrepeat', {username: self.username})
                .then(function (res) {
                    if(res.data.notRepeat) {
                        self.notrepeat = true;
                    }else{
                        self.notrepeat = false;
                    }
                });
        },
        isYanshi: function(e) {
            var username = $('#username').val();
            if(username == 'yanshi'){
                e.stopPropagation();
                e.preventDefault();
                layer.msg('演示账户不能添加下级用户！')
            }
        }
    }
});