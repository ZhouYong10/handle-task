/**
 * Created by ubuntu64 on 3/15/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));

var Utils = require('utils');

new Vue({
    el: '#wxLike',
    data: {
        price: '',
        price2: '',
        address: '',
        articleTitle: '',
        totalPrice: 0,
        num: '',
        num2: '',
        funds: 0
    },
    methods: {
        parseAddress: function() {
            var self = this;
            Utils.wxParseAddress(self.$http, self.address)
                .then(function(title) {
                    self.articleTitle = title;
                },function(message) {
                    alert(message);
                })
        },
        total: function() {
            this.totalPrice = (this.price * this.num + this.price2 * this.num2).toFixed(4);
        }
    },
    validators: {
        isaddress: function(val) {
            return /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(val);
        },
        minnum: function(val) {
            var like = val ? val : 0;
            var read = this.num ? this.num : 0;
            return parseInt(like) <= parseInt(read*3/100);
        },
        isnum: Utils.isNum,
        min500: Utils.min500,
        maxprice: function() {
            return parseFloat(this.price * this.num + this.price2 * this.num2) <= parseFloat(this.funds);
        }
    }
});