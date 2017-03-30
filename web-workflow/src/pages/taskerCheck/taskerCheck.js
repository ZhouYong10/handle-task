/**
 * Created by ubuntu64 on 3/25/16.
 */
var Utils = require('utils');

$(function () {
    $('.fancybox').fancybox();
    Utils.layPrompt('请输入投诉原因！');
    Utils.breakText();
    Utils.isFreeze();
    Utils.layPage();
});