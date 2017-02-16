/**
 * Created by ubuntu64 on 3/8/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));

var Utils = require('utils');

new Vue({
    el: '#wxFans',
    data: {
        fansPrice: '',
        myFansPrice: '',
        replyPrice: '',
        myReplyPrice: '',
        num: '',
        isReply: '',
        count: 0,
        funds: ''
    },
    methods: {
        total: function() {
            if(this.isReply){
                this.count = ((parseFloat(this.myFansPrice) + parseFloat(this.myReplyPrice)) * parseInt(this.num)).toFixed(4);
            }else {
                this.count = (parseFloat(this.myFansPrice) * parseInt(this.num)).toFixed(4);
            }
        },
        viewCode: function() {
            var $file = $('#doc-ipt-file-1');
            var fileObj = $file[0];
            var windowURL = window.URL || window.webkitURL;
            var dataURL;
            var $img = $("#erweima");

            if(fileObj && fileObj.files && fileObj.files[0]){
                dataURL = windowURL.createObjectURL(fileObj.files[0]);
                $img.attr('src',dataURL);
            }else{
                dataURL = $file.val();

                // $img.css("filter",'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod = scale,src="' + dataURL + '")');

                // var imgObj = document.getElementById("preview");
                // imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\"" + dataURL + "\")";
                // imgObj.style.width = "48px";
                // imgObj.style.height = "48px";

                var imgObj = document.getElementById("preview");
                // 两个坑:
                // 1、在设置filter属性时，元素必须已经存在在DOM树中，动态创建的Node，也需要在设置属性前加入到DOM中，先设置属性在加入，无效；
                // 2、src属性需要像下面的方式添加，上面的两种方式添加，无效；
                imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
                imgObj.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = dataURL;

            }
            $('#erweimaTip').css('display', 'none');
        },
        viewImg: function() {
            var $file = $('#doc-ipt-file-2');
            var fileObj = $file[0];
            var windowURL = window.URL || window.webkitURL;
            var dataURL;
            var $img = $("#preview");

            if(fileObj && fileObj.files && fileObj.files[0]){
                dataURL = windowURL.createObjectURL(fileObj.files[0]);
                $img.attr('src',dataURL);
            }else{
                dataURL = $file.val();

                // $img.css("filter",'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod = scale,src="' + dataURL + '")');

                // var imgObj = document.getElementById("preview");
                // imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\"" + dataURL + "\")";
                // imgObj.style.width = "48px";
                // imgObj.style.height = "48px";

                var imgObj = document.getElementById("preview");
                // 两个坑:
                // 1、在设置filter属性时，元素必须已经存在在DOM树中，动态创建的Node，也需要在设置属性前加入到DOM中，先设置属性在加入，无效；
                // 2、src属性需要像下面的方式添加，上面的两种方式添加，无效；
                imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
                imgObj.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = dataURL;

            }
            $('#photoTip').css('display', 'none');
        },
        check: function(e) {
            if(!$('#doc-ipt-file-2').val()){
                e.stopPropagation();
                e.preventDefault();
                $('#photoTip').css('display', 'inline-block');
            }
            if(!$('#doc-ipt-file-1').val()){
                e.stopPropagation();
                e.preventDefault();
                $('#erweimaTip').css('display', 'inline-block');
            }
        }
    },
    validators: {
        isnum: Utils.isNum,
        min20: Utils.min20,
        maxprice: function(num) {
            var myFansPrice = this.myFansPrice ? this.myFansPrice : 0;
            var myReplyPrice = this.myReplyPrice ? this.myReplyPrice : 0;
            if(this.isReply){
                return (parseFloat(myFansPrice) + parseFloat(myReplyPrice)) * parseInt(num ? num : 0) <= parseFloat(this.funds);
            }else {
                return parseFloat(myFansPrice) * parseInt(num ? num : 0) <= parseFloat(this.funds);
            }
        },
        isfloat: Utils.isfloat,
        minfansprice: function(price) {
            return parseFloat(price) >= parseFloat(this.fansPrice);
        },
        minreplyprice: function(price) {
            return parseFloat(price) >= parseFloat(this.replyPrice);
        }
    }
});