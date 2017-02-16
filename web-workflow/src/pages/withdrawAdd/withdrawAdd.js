/**
 * Created by ubuntu64 on 3/21/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));
var Utils = require('utils');

new Vue({
    el: '#withdraw',
    data: {
        userFunds: ''
    },
    validators: {
        isfloat: Utils.isfloat,
        mustOne: function(funds) {
            return parseFloat(funds) >= 30;
        },
        mintotal: function(funds) {
            var val = funds.trim();
            return val == '' ? true : parseFloat(val) <= parseFloat(this.userFunds);
        }
    }
});