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
        price: 0,
        address: '',
        title: '',
        smallType: '',
        addName: '',
        num: '',
        remark: '【每行一条内容】',
        totalPrice: 0,
        funds: ''
    },
    methods: {
        parseAddress: function() {
            var self = this;
            Utils.parseForumAddress(self.$http, self.address)
                .then(function(obj) {
                    self.title = obj.title;
                    self.price = obj.price;
                    self.smallType = obj.smallType;
                    self.addName = obj.addName;
                    self.remark = '【每行一条内容】' + obj.remark;
                },function(message) {
                    alert(message);
                })
        },
        getTotalPrice: function() {
            var self = this;
            self.num = $('#contentSelf').val().split('\n').length;
            var totalPrice = (self.price * self.num).toFixed(4);
            if(totalPrice < 0.5) {
                self.totalPrice = 0.5;
            }else {
                self.totalPrice = totalPrice;
            }
        }
    },
    validators: {
        isaddress: function(val) {
            return /((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(val);
        },
        isnum: Utils.isNum,
        maxprice: function() {
            var self = this;
            var content = $('#contentSelf').val();
            if(content){
                return parseFloat(self.price * content.split('\n').length) <= parseFloat(self.funds);
            }else {
                return true;
            }
        }
    }
});