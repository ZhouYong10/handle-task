/**
 * Created by zhouyong10 on 2/18/16.
 */
var Vue = require('vue');

new Vue({
    el: '#userInfo',
    data: {
        taskAccount: '',
        taskName: '',
        isNone: false,
        isEdit: false
    },
    methods: {
        edit: function() {
            this.isEdit = true;
        },
        cancel: function() {
            this.isEdit = false;
            this.isNone = false;
        },
        check: function(e) {
            var self = this;
            if(!self.taskAccount || !self.taskName) {
                e.stopPropagation();
                e.preventDefault();
                self.isNone = true;
            }
        }
    }
});