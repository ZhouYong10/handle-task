/**
 * Created by ubuntu64 on 3/8/16.
 */
var Vue = require('vue');
var Utils = require('utils');

new Vue({
    el: '#wxFans',
    data: {
        fansPrice: '',
        count: 0,
        funds: ''
    },
    methods: {
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
        totalPrice: function() {
            var fansPrice = $('#fansPrice').val();
            var num = $('#fansNum').val();

            this.count = (parseFloat(fansPrice) * parseInt(num)).toFixed(4);
            if(Utils.isPlusNum(this.count)) {
                if(parseFloat(this.count) > parseFloat(this.funds)) {
                    $('#totalPrice').next().css('display', 'inline');
                    return false;
                }else{
                    $('#totalPrice').next().css('display', 'none');
                    return true;
                }
            }else{
                $('#totalPrice').next().css('display', 'none');
                return false;
            }
        },
        checkTitle: function() {
            var $title = $('#title');
            if(Utils.isEmpty($title.val())){
                $title.next().css('display', 'inline');
                return false;
            }else{
                $title.next().css('display', 'none');
                return true;
            }
        },
        checkFansID: function() {
            var $fansID = $('#fansID');
            if(Utils.isEmpty($fansID.val())){
                $fansID.next().css('display', 'inline');
                return false;
            }else{
                $fansID.next().css('display', 'none');
                return true;
            }
        },
        checkRemark: function() {
            var $fansRemark = $('#remark');
            if(Utils.isEmpty($fansRemark.val())){
                $fansRemark.next().css('display', 'inline');
                return false;
            }else{
                $fansRemark.next().css('display', 'none');
                return true;
            }
        },
        checkFansPrice: function() {
            var $fansPrice = $('#fansPrice');
            var fansPrice = $fansPrice.val();
            if(Utils.isPlusNum(fansPrice) && parseFloat(fansPrice) >= parseFloat(this.fansPrice)){
                $fansPrice.next().css('display', 'none');
                this.totalPrice();
                return true;
            }else{
                $fansPrice.next().css('display', 'inline');
                return false;
            }
        },
        checkFansNum: function() {
            var $num = $('#fansNum');
            var num = $num.val();
            if(Utils.isInteger(num) && Utils.min20(num)){
                $num.next().css('display', 'none');
                this.totalPrice();
                return true;
            }else{
                $num.next().css('display', 'inline');
                return false;
            }
        },
        check: function(e) {
            var isCommit = this.checkTitle() && this.checkFansID() && this.checkRemark() && this.checkFansPrice() &&
                this.checkFansNum() && this.totalPrice();
            if(!isCommit) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
            if(!$('#doc-ipt-file-2').val()){
                e.stopPropagation();
                e.preventDefault();
                $('#photoTip').css('display', 'inline-block');
            }
        }
    }
});