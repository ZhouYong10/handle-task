/**
 * Created by ubuntu64 on 3/8/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));

var Utils = require('utils');

new Vue({
    el: '#wxCode',
    data: {
        fansPrice: 0,
        replyPrice: 0,
        reply: '',
        num: '',
        count: 0,
        funds: 0
    },
    methods: {
        total: function() {
            var self = this;
            var num = self.num == '' ? 0 : self.num;
            if(self.reply == ''){
                self.count = (self.fansPrice * num).toFixed(4);
            }else {
                self.count = ((parseFloat(self.fansPrice) + parseFloat(self.replyPrice)) * num).toFixed(4);
            }
        }
    },
    validators: {
        isnum: Utils.isNum,
        min20: Utils.min20,
        maxprice: function(nub) {
            var self = this;
            var num = nub == '' ? 0 : nub;
            if(self.reply == ''){
                return (self.fansPrice * num) <= parseFloat(self.funds);
            }else {
                return ((parseFloat(self.fansPrice) + parseFloat(self.replyPrice)) * num) <= parseFloat(self.funds);
            }
        }
    }
});