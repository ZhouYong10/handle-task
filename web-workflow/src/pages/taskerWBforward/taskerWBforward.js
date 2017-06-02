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
    $('.fancybox').fancybox();
    Utils.layPrompt('出价越高，在任务大厅的显示越靠前！', '.onTop');
    Utils.breakText();
    Utils.isFreeze();
    Utils.layPage();
});