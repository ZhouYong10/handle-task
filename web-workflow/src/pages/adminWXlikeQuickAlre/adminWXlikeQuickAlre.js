/**
 * Created by ubuntu64 on 4/26/16.
 */
var Utils = require('utils');

var Vue = require('vue');
Vue.use(require('vue-validator'));

new Vue({
    el: '#searchForm'
});

$(function () {
    Utils.layPage();
    Utils.breakText();
    Utils.clipboard();
    Utils.layPrompt('请输入错误处理信息！', '.dealError');
    Utils.layPrompt('请输入退款理由！', '.refundProfit');
});