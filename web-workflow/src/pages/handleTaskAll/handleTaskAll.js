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
    Utils.isFreeze();
    Utils.layPage();
});