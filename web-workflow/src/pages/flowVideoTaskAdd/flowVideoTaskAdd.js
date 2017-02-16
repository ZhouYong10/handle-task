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
        price: '',
        num: '',
        funds: 0,
        totalPrice: 0
    },
    validators: {
        isaddress: function(val) {
            return /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(val);
        },
        isnum: Utils.isNum,
        maxprice: function(input) {
            var self = this;
            var num;
            if(Utils.isNum(input) && input != ''){
                if(input <= 10000) {
                    num = 10000;
                }else {
                    num = parseInt(input / 1000) * 1000 + (input % 1000 > 0 ? 1 : 0) * 1000;
                }
            }else {
                num = 0;
            }

            self.totalPrice = (num / 1000 * parseFloat(self.price)).toFixed(4);
            return parseFloat(self.totalPrice) <= parseFloat(self.funds);
        }
    }
});