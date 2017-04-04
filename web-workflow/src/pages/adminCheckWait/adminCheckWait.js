/**
 * Created by ubuntu64 on 4/4/17.
 */
var Utils = require('utils');

var Vue = require('vue');
Vue.use(require('vue-resource'));

new Vue({
    el: '#orderCheck',
    data: {
        orderCheckIsOpen: ''
    },
    methods: {
        orderCheckOpen: function() {
            var self = this;
            this.$http.get('/admin/orderCheckOpen')
                .then(function(res){
                self.orderCheckIsOpen = res.data;
            });
        },
        orderCheckClose: function() {
            var self = this;
            this.$http.get('/admin/orderCheckClose')
                .then(function(res){
                self.orderCheckIsOpen = res.data;
            });
        }
    }
});

$(function () {
    $('.fancybox').fancybox();
    Utils.layPrompt('请输入拒绝接单的理由！', '.orderRefund');
    Utils.breakText();
    Utils.layPage();
});
