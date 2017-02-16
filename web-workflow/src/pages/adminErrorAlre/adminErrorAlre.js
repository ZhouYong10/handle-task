/**
 * Created by ubuntu64 on 3/25/16.
 */
var Utils = require('utils');

var Vue = require('vue');
Vue.use(require('vue-validator'));

new Vue({
    el: '#searchForm'
});

$(function () {
    Utils.clipboard();
    Utils.layPrompt('请输入退款理由！', '.refundProfit');
    Utils.breakText();
    Utils.layPage();
});

