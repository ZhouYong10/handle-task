/**
 * Created by ubuntu64 on 3/16/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));

var Utils = require('utils');

new Vue({
    el: '#wbFans',
    data: {
        price: '',
        totalPrice: 0,
        num: '',
        funds: 0
    },
    methods: {
        selectType: function() {
            var self = this;
            this.$http.get('/wb/get/price/by/type', {type: this.type})
                .then(function (res) {
                    self.price = res.data.price;
                    self.totalPrice = (self.price * self.num).toFixed(4);
                });
        },
        total: function() {
            this.totalPrice = (this.price * this.num).toFixed(4);
        }
    },
    validators: {
        isaddress: function(val) {
            return /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(val);
        },
        isnum: Utils.isNum,
        min100: Utils.min100,
        maxprice: function(num) {
            return parseFloat(this.price * num) <= parseFloat(this.funds);
        }
    }
});