/**
 * Created by ubuntu64 on 4/18/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));
var Utils = require('utils');

new Vue({
    el: '#flowForum',
    data: {
        price: 0,
        address: '',
        num: '',
        funds: 0,
        totalPrice: 0
    },
    methods: {
        judgeAddress: function() {
            var self = this;
            Utils.parseFlowAddress(self.$http, self.address)
                .then(function(isFlow) {
                    if(isFlow) {
                        alert('检测到您提交的是视频地址，请到视频流量任务提交订单！！')
                    }else{
                        $('form').submit();
                    }
                })
        }
    },
    validators: {
        isaddress: function(val) {
            return /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(val);
        },
        isnum: Utils.isNum,
        maxprice: function(input) {
            var self = this;
            var num;
            if(input <= 10000) {
                num = 10000;
            }else {
                num = parseInt(input / 5000) * 5000 + (input % 5000 > 0 ? 1 : 0) * 5000;
            }
            self.totalPrice = (num / 5000 * self.price).toFixed(4);
            return parseFloat(self.totalPrice) <= self.funds;
        }
    }
});