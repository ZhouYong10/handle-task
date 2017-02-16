/**
 * Created by ubuntu64 on 2/26/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));

var Utils = require('utils');


new Vue({
    el: '#recharge',
    data: {
        num: ''
    },
    methods: {
        commit: function() {
            console.log(this.num);
            this.$http.post('/user/recharge', {
                alipayId: this.num
            }).then(function(res) {
                if(res.data.isOK) {
                    $('<a href="' + res.data.path + '" ></a>').get(0).click();
                }else{
                    layer.msg(res.data.message);
                }
            });
        }
    },
    validators: {
        isnum: Utils.isNum
    }
});