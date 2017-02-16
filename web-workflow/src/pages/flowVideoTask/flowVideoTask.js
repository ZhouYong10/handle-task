/**
 * Created by ubuntu64 on 4/18/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));
var Utils = require('utils');

new Vue({
    el: '#flowVideo',
    data: {
        price: 0,
        name: '',
        address: '',
        num: '',
        funds: 0,
        totalPrice: 0
    },
    methods: {
        getPrice: function() {
            var self = this;
            self.$http.get('/flow/video/get/price', {address: self.address})
                .then(function(res) {
                    if(res.data.isOk) {
                        self.price = res.data.price;
                        self.name = res.data.name;
                    }else {
                        alert(res.data.message);
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
                num = parseInt(input / 1000) * 1000 + (input % 1000 > 0 ? 1 : 0) * 1000;
            }
            self.totalPrice = (num / 1000 * self.price).toFixed(4);
            return parseFloat(self.totalPrice) <= self.funds;
        }
    }
});