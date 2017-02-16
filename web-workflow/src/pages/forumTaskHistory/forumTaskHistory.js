/**
 * Created by ubuntu64 on 4/14/16.
 */
var Utils = require('utils');

var Vue = require('vue');
Vue.use(require('vue-validator'));

new Vue({
    el: '#searchForm'
});

$(function () {
    Utils.layPrompt('请输入错误原因！');
    Utils.breakText();
    Utils.isFreeze();
    Utils.layPage();
});