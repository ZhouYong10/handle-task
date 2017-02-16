/**
 * Created by ubuntu64 on 4/8/16.
 */
var Utils = require('utils');

var Vue = require('vue');
Vue.use(require('vue-resource'));

new Vue({
    el: '#openOrClose',
    data: {
        isOpen: 'no'
    },
    methods: {
        //open: function() {
        //    var self = this;
        //    layer.config({
        //        extend: 'extend/layer.ext.js'
        //    });
        //    var index = layer.prompt({
        //        formType: 2,
        //        title: '请输入cookie信息！',
        //        offset: '6%'
        //    }, function (value, index) {
        //        self.$http.get('/admin/open/wx/read/like', {cookie: value})
        //            .then(function (data) {
        //                layer.close(index);
        //                self.isOpen = 'yes';
        //            });
        //    });
        //},
        open: function() {
            var self = this;
            self.$http.get('/admin/open/wx/read/like')
                .then(function () {
                    self.isOpen = 'yes';
                });
        },
        close: function() {
            var self = this;
            self.$http.get('/admin/close/wx/read/like')
                .then(function (data) {
                    self.isOpen = 'no';
                });
        },
        weichuanmei: function() {
            var self = this;
            layer.config({
                extend: 'extend/layer.ext.js'
            });
            var index = layer.prompt({
                formType: 2,
                title: '请输入限制微帮的单个订单阅读量！',
                offset: '6%'
            }, function (value, index) {
                self.$http.get('/admin/weichuanmei/order/num/WXlike', {weichuanmeiOrderNum: value})
                    .then(function (data) {
                        layer.close(index);
                        if(data.data.isOk) {
                            $('#weichuanmeiNum').text('微帮限量(' + value + ')')
                        }else{
                            layer.msg(data.data.msg);
                        }
                    });
            });
        },
        dingding: function() {
            var self = this;
            layer.config({
                extend: 'extend/layer.ext.js'
            });
            var index = layer.prompt({
                formType: 2,
                //title: '请输入限制代丁的单个订单阅读量！',
                title: '请输入限制丁丁的单个订单阅读量！',
                offset: '6%'
            }, function (value, index) {
                self.$http.get('/admin/dingding/order/num/WXlike', {dingdingOrderNum: value})
                    .then(function (data) {
                        layer.close(index);
                        if(data.data.isOk) {
                            //$('#dingdingNum').text('代丁限量(' + value + ')')
                            $('#dingdingNum').text('丁丁限量(' + value + ')')
                        }else{
                            layer.msg(data.data.msg);
                        }
                    });
            });
        },
        readSpeed: function() {
            var self = this;
            layer.config({
                extend: 'extend/layer.ext.js'
            });
            var index = layer.prompt({
                formType: 2,
                title: '请输入任务执行速度（/分）！',
                offset: '6%'
            }, function (value, index) {
                self.$http.get('/admin/WXlike/read/speed', {readSpeed: value})
                    .then(function (result) {
                        layer.close(index);
                        $('#readSpeed').text(result.data);
                    });
            });
        }
    }
});

$(function () {
    Utils.clipboard();
    Utils.layPrompt('请输入拒绝接单的理由！', '.orderRefund');
    Utils.layPrompt('请输入订单初始阅读量！', '.orderComplete');
    Utils.breakText();
    Utils.layPage();
});