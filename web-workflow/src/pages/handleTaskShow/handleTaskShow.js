/**
 * Created by zhouyong10 on 5/26/16.
 */
var Vue = require('vue');
Vue.use(require('vue-validator'));

new Vue({
    el: '#wxFans',
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
        check: function(e) {
            if(!$('#doc-ipt-file-2').val()){
                e.stopPropagation();
                e.preventDefault();
                $('#photoTip').css('display', 'inline-block');
            }
        }
    }
});

$(function () {
    $('.fancybox').fancybox();
});