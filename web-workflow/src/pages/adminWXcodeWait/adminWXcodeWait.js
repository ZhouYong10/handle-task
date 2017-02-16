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
        open: function() {
            var self = this;
            layer.config({
                extend: 'extend/layer.ext.js'
            });
            var index = layer.prompt({
                formType: 2,
                title: '请输入cookie信息！',
                offset: '6%',
                maxlength: 1000
            }, function (value, index) {
                self.$http.get('/admin/open/wx/fans', {cookie: value})
                    .then(function (data) {
                        layer.close(index);
                        self.isOpen = 'yes';
                    });
            });
        },
        close: function() {
            var self = this;
            self.$http.get('/admin/close/wx/fans')
                .then(function (data) {
                    self.isOpen = 'no';
                });
        }
    }
});

$(function () {
    Utils.clipboard();
    Utils.layPrompt('请输入拒绝接单的理由！', '.orderRefund');
    Utils.breakText();
    Utils.layPage();
});