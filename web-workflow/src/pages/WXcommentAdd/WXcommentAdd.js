/**
 * Created by ubuntu64 on 4/13/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
Vue.use(require('vue-resource'));

var Utils = require('utils');

new Vue({
    el: '#forumReply',
    data: {
        price: '',
        address: '',
        title: '',
        num: '',
        remark: '【每行一条内容】',
        totalPrice: 0,
        funds: ''
    },
    methods: {
        parseAddress: function() {
            var self = this;
            Utils.wxParseAddress(self.$http, self.address)
                .then(function(title) {
                    self.title = title;
                },function(message) {
                    alert(message);
                })
        },
        getTotalPrice: function() {
            var self = this;
            var num = $('#contentSelf').val().split('\n').length;
            self.num = (num > 5) ? num : 5;
            var totalPrice = (parseFloat(self.price) * self.num).toFixed(4);
            self.totalPrice = totalPrice;
        }
    },
    validators: {
        isaddress: function(val) {
            return /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(val);
        },
        maxprice: function(val) {
            var self = this;
            if(val){
                return parseFloat(parseFloat(self.price) * val.split('\n').length) <= parseFloat(self.funds);
            }else {
                return true;
            }
        }
    }
});