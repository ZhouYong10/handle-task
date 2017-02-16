/**
 * Created by ubuntu64 on 3/15/16.
 */
var Vue = require('vue');
Vue.use(require('vue-resource'));
var Utils = require('utils');

var ordersAdd = Vue.extend({
    template: __inline('ordersAdd.html'),
    props: ['view', 'price', 'price2', 'orders'],
    data: function(){
        return {
            itemsTxt: ''
        };
    },
    methods: {
        parseTxt: function() {
            var self = this;
            if(self.itemsTxt == '') {
                return alert('请填写要提交的订单信息！');
            }

            console.log('parseTxt');
            var orders = self.orders;
            var items = self.itemsTxt.split(/[\r\n]/);
            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                var orderData = item.split(/[ ]+/);
                var $order = new Vue({data: {
                    address: '',
                    num: '',
                    num2: '',
                    errMsg: '',
                    noErr: true,
                    price: self.price,
                    price2: self.price2,
                    totalPrice: 0,
                    title: ''
                }});
                $order.address = orderData[0];
                $order.num = orderData[1];
                $order.num2 = orderData[2];
                checkOrder($order);
                (function(order) {
                    Utils.wxParseAddress(self.$http, $order.address)
                        .then(function (title) {
                            order.title =  title;
                        }, function (message) {
                            order.errMsg = order.errMsg + message + '. ';
                        });
                })($order);

                orders.push($order);
            }

            this.view = 'tables';
        },
        parseExcel: function() {
            console.log('parseExcel');
            console.log(this.itemsTxt);
            this.view = 'tables';
        }
    }
});

var ordersTable = Vue.extend({
    template: __inline('ordersTable.html'),
    props: ['orders'],
    methods: {
        edit: function(order) {
            order.noErr = 'edit';
        },
        save: function(order) {
            order.noErr = true;
            order.errMsg = '';
            checkOrder(order);
        },
        commit: function(order) {
            order.noErr = 'committed';
            this.$http.post('/wx/like/quick/add', {address: order.address, title: order.title, num: order.num, num2: order.num2})
                .then(function (res) {
                    order.errMsg = res.data.msg;
                    $('.userCash').text(res.data.funds);
                });
        }
    }
});

new Vue({
    el: '#wxLike',
    data: {
        readPrice: '',
        likePrice: '',
        currentView: 'add',
        orders: []
    },
    components: {
        add: ordersAdd,
        tables: ordersTable
    }
});

function checkOrder(order) {
    if(!/((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig.test(order.address)) {
        order.$set('noErr', false);
        order.$set('errMsg', order.errMsg + '请填写合法的url地址. ');
        return;
    }
    if(!Utils.isNum(order.num)){
        order.$set('noErr', false);
        order.$set('errMsg', order.errMsg + '阅读数量必须是正整数. ');
        return;
    }
    if(Utils.isNum(order.num) && !Utils.min500(order.num)){
        order.$set('noErr', false);
        order.$set('errMsg', order.errMsg + '阅读数量最低500起. ');
        return;
    }
    if(Utils.isNum(order.num) && Utils.isNum(order.num2) && !(parseInt(order.num2) <= parseInt(order.num*3/100))) {
        order.$set('noErr', false);
        order.$set('errMsg', order.errMsg + '点赞数量不能大于阅读数量的3%. ');
        return;
    }
    if(Utils.isNum(order.num) && !Utils.isNum(order.num2)){
        order.num2 = parseInt(order.num / 1000 * 5);
        order.$set('totalPrice', (order.price * order.num + order.price2 * (order.num2 - parseInt(order.num / 1000 * 5))).toFixed(4));
    }else{
        order.$set('totalPrice', (order.price * order.num + order.price2 * order.num2).toFixed(4));
    }
}