/**
 * Created by ubuntu64 on 3/5/16.
 */
var Utils = require('utils');

var smallType = '<td> ' +
    '<select class="am-form-group am-form-select smallType"> ' +
    '<option value="forum">论坛</option> ' +
    '<option value="video">视频</option> ' +
    '</select> ' +
    '</td> ';
var condition = '<td> ' +
    '<select class="am-form-group am-form-select condition"> ' +
    '<option value="normal">正常</option> ' +
    '<option value="develop">开发中</option> ' +
    '<option value="maintain">维护中</option> ' +
    '</select> ' +
    '</td> ';
var upload = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs upload">上传</button>';
var saveBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs save">保存</button> ';
var cancelBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs cancel">取消</button> ';
var changeSaveBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs changeSave">保存</button> ';
var giveUpBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs giveUp">放弃</button> ';
var changeBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs edit">修改</button> ';
var deleteBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs delete">删除</button> ';
var priceItem = '<tr> ' +
    '<td class="num"></td> ' +
    smallType+
    '<td> ' +
    upload +
    ' </td> ' +
    '<td> <input class="am-form-field am-input-sm name" type="text" placeholder="名称"> </td> ' +
    '<td> <input class="am-form-field am-input-sm address" type="text" placeholder="域名 "> </td> ' +
    '<td> <input class="am-form-field am-input-sm adminPrice" type="text" placeholder="管理员价格"> </td> ' +
    '<td> <input class="am-form-field am-input-sm topPrice" type="text" placeholder="顶级代理价格"> </td> ' +
    '<td> <input class="am-form-field am-input-sm superPrice" type="text" placeholder="超级代理价格"> </td> ' +
    '<td> <input class="am-form-field am-input-sm goldPrice" type="text" placeholder="金牌代理价格"> </td> ' +
    condition +
    '<td> <textarea class="remark" rows="1" cols="28"></textarea> </td> ' +
    '<td> ' +
    saveBtn +
    cancelBtn +
    '</td> ' +
    '</tr>';
var priceItemText = '<tr> ' +
    '<td class="num"></td> ' +
    '<td class="smallType"><span></span> <input type="hidden" value=""></td> ' +
    '<td class="logo"> <img /> </td>'+
    '<td class="name"> </td> ' +
    '<td class="address"> </td> ' +
    '<td class="adminPrice"> </td> ' +
    '<td class="topPrice"> </td> ' +
    '<td class="superPrice"> </td> ' +
    '<td class="goldPrice"> </td> ' +
    '<td class="condition"><span></span> <input type="hidden" value=""></td> ' +
    '<td class="remark"><a class="am-text-truncate text-break" title=""></a></td> ' +
    '<td class="operation"> </td> ' +
    '</tr>';
var $changeItemTr ;

$(function () {
    Utils.layPage();
    Utils.breakText();

    registerEditDelete($('.priceFlow tbody'));

    $('#addPrice').off().click(function () {
        var $tbody = $('.priceFlow tbody');
        var $tr = $(priceItem);
        $tbody.prepend($tr);
        resortNum($tbody);
        registerSaveCancel($tbody);
    })
});

function resortNum($tbody) {
    var allTr = $tbody.children();
    for(var i = 0; i < allTr.length; i++) {
        $(allTr[i]).find('.num').text(i + 1);
    }
}

function registerEditDelete($tbody) {
    $tbody.find('.edit').off().click(function () {
        var self = this;
        var $parentTd = $(self).parent();
        var $parentTr = $parentTd.parent();
        $changeItemTr = $parentTr;
        var num = $parentTr.find('.num').text();

        var $newParentTr = $(priceItem);

        var $uploadBtn = $newParentTr.find('.upload');
        var $uploadBtnParent = $uploadBtn.parent();
        $uploadBtn.remove();
        $uploadBtnParent.append($('<div class="imgWrap"><img src="' +
            $parentTr.find('.logo img').attr('src') + '"/><input type="hidden" value="' +
            $parentTr.find('.logo img').attr('src') + '"><a class="am-icon-remove removeImg" title="删除图片"></a></div>'));

        var $newBtnParent = $newParentTr.find('.save').parent();
        $newBtnParent.children().remove();
        $newBtnParent.append($(changeSaveBtn + giveUpBtn + '<input type="hidden" value="'+$parentTr.find('.operation input').val()+'">'));

        $newParentTr.find('.num').text(num);
        $newParentTr.find('.smallType').val($parentTr.find('.smallType input').val());
        $newParentTr.find('.name').val($parentTr.find('.name').text());
        $newParentTr.find('.address').val($parentTr.find('.address').text());
        $newParentTr.find('.adminPrice').val($parentTr.find('.adminPrice').text());
        $newParentTr.find('.topPrice').val($parentTr.find('.topPrice').text());
        $newParentTr.find('.superPrice').val($parentTr.find('.superPrice').text());
        $newParentTr.find('.goldPrice').val($parentTr.find('.goldPrice').text());
        $newParentTr.find('.condition').val($parentTr.find('.condition input').val());
        $newParentTr.find('.remark').val($.trim($parentTr.find('.remark .text-break').text()));

        var $aim ;
        if(num == 1) {
            $aim = $parentTr.parent();
            $parentTr.remove();
            $aim.prepend($newParentTr);
        }else {
            $aim = $parentTr.prev();
            $parentTr.remove();
            $aim.after($newParentTr);
        }
        registerChangeSaveGiveUp($tbody);
        removeImg($tbody);
        Utils.breakText();
    });

    $tbody.find('.delete').off().click(function () {
        var self = this;
        var $parentTd = $(self).parent();
        var $parentTr = $parentTd.parent();
        var id = $parentTd.find('input').val();
        var index = layer.confirm('您确定要删除么？', function(){
            $.post('/admin/price/flow/delete', {id: id}, function (result) {
                $parentTr.remove();
                resortNum($tbody);
                layer.close(index);
                layer.msg('删除成功！');
            });
        });
    });
}

function registerChangeSaveGiveUp($tbody) {
    $tbody.find('.changeSave').off().click(function () {
        var $parentTd = $(this).parent();
        var $tr = $parentTd.parent();
        var product = {
            id: $tr.find('.giveUp').next().val(),
            smallType: $tr.find('.smallType').val(),
            smallTypeName: $tr.find('.smallType').find('option:selected').text(),
            logo: $tr.find('.imgWrap input').val(),
            name: $tr.find('.name').val(),
            address: $tr.find('.address').val(),
            adminPrice: $tr.find('.adminPrice').val(),
            topPrice: $tr.find('.topPrice').val(),
            superPrice: $tr.find('.superPrice').val(),
            goldPrice: $tr.find('.goldPrice').val(),
            condition: $tr.find('.condition').val(),
            conditionName: $tr.find('.condition').find('option:selected').text(),
            remark: $tr.find('.remark').val()
        };
        $.post('/admin/price/flow/update', product, function() {
            var $priceItemText = $(priceItemText);
            var num = $tr.find('.num').text();

            $priceItemText.find('.num').text(num);
            $priceItemText.find('.smallType span').text(product.smallTypeName);
            $priceItemText.find('.smallType input').val(product.smallType);
            $priceItemText.find('.name').text(product.name);
            $priceItemText.find('.logo img').attr('src', product.logo);
            $priceItemText.find('.address').text(product.address);
            $priceItemText.find('.adminPrice').text(product.adminPrice);
            $priceItemText.find('.topPrice').text(product.topPrice);
            $priceItemText.find('.superPrice').text(product.superPrice);
            $priceItemText.find('.goldPrice').text(product.goldPrice);
            $priceItemText.find('.condition span').text(product.conditionName);
            $priceItemText.find('.condition input').val(product.condition);
            $priceItemText.find('.remark .text-break').text(product.remark);
            $priceItemText.find('.remark .text-break').attr('title', product.remark);
            $priceItemText.find('.operation').append($(changeBtn + deleteBtn + '<input type="hidden" value="' + product.id + '">'));
            var $aim ;
            if($tr.prev().length > 0) {
                $aim = $tr.prev();
                $tr.remove();
                $aim.after($priceItemText);
            }else {
                $aim = $tr.parent();
                $tr.remove();
                $aim.prepend($priceItemText);
            }
            registerEditDelete($tbody);
            Utils.breakText();
        })
    });

    $tbody.find('.giveUp').off().click(function () {
        var $parentTd = $(this).parent();
        var $tr = $parentTd.parent();

        var $aim ;
        if($tr.prev().length > 0) {
            $aim = $tr.prev();
            $tr.remove();
            $aim.after($changeItemTr);
        }else {
            $aim = $tr.parent();
            $tr.remove();
            $aim.prepend($changeItemTr);
        }
        registerEditDelete($tbody);
    });
}

function registerSaveCancel($tbody) {
    $tbody.find('.save').off().click(function () {
        var $parentTd = $(this).parent();
        var $tr = $parentTd.parent();
        var product = {
            type: 'flow',
            typeName: '流量',
            smallType: $tr.find('.smallType').val(),
            smallTypeName: $tr.find('.smallType').find('option:selected').text(),
            logo: $tr.find('.imgWrap input').val(),
            name: $tr.find('.name').val(),
            address: $tr.find('.address').val(),
            adminPrice: $tr.find('.adminPrice').val(),
            topPrice: $tr.find('.topPrice').val(),
            superPrice: $tr.find('.superPrice').val(),
            goldPrice: $tr.find('.goldPrice').val(),
            condition: $tr.find('.condition').val(),
            conditionName: $tr.find('.condition').find('option:selected').text(),
            remark: $tr.find('.remark').val()
        };
        $.post('/admin/price/flow', product, function(result) {
            var $priceItemText = $(priceItemText);
            var num = $tr.find('.num').text();

            $priceItemText.find('.num').text(num);
            $priceItemText.find('.smallType span').text(result.smallTypeName);
            $priceItemText.find('.smallType input').val(result.smallType);
            $priceItemText.find('.name').text(result.name);
            $priceItemText.find('.logo img').attr('src', result.logo);
            $priceItemText.find('.address').text(result.address);
            $priceItemText.find('.adminPrice').text(result.adminPrice);
            $priceItemText.find('.topPrice').text(result.topPrice);
            $priceItemText.find('.superPrice').text(result.superPrice);
            $priceItemText.find('.goldPrice').text(result.goldPrice);
            $priceItemText.find('.condition span').text(result.conditionName);
            $priceItemText.find('.condition input').val(result.condition);
            $priceItemText.find('.remark .text-break').text(result.remark);
            $priceItemText.find('.remark .text-break').attr('title', result.remark);
            $priceItemText.find('.operation').append($(changeBtn + deleteBtn + '<input type="hidden" value="' + result._id + '">'));

            var $aim ;
            if($tr.prev().length > 0) {
                $aim = $tr.prev();
                $tr.remove();
                $aim.after($priceItemText);
            }else {
                $aim = $tr.parent();
                $tr.remove();
                $aim.prepend($priceItemText);
            }
            registerEditDelete($tbody);
            Utils.breakText();
        })
    });

    $tbody.find('.cancel').off().click(function () {
        var self = this;
        var index = layer.confirm('您确定要取消么？', function(){
            var $tr = $(self).parent().parent();
            $tr.remove();
            resortNum($tbody);
            layer.close(index);
        });
    });

    uploadImg($tbody);
}

function uploadImg($tbody) {
    $tbody.find('.upload').off().click(function() {
        var $upload = $('<input type="file">');
        $upload.get(0).click();
        $upload.change(function() {
            //check whether browser fully supports all File API
            if (window.File && window.FileReader && window.FileList && window.Blob)
            {
                var file = $upload[0].files[0];
                var fsize = file.size; //get file size
                var ftype = file.type; // get file type

                //allow only valid image file types
                switch(ftype)
                {
                    case 'image/png': case 'image/gif': case 'image/jpeg': case 'image/pjpeg':
                    break;
                    default:
                        layer.msg('不支持的文件格式，请选择图片文件！');
                        return false
                }

                //Allowed file size is less than 1 MB (1048576)
                if(fsize>1024*1024)
                {
                    layer.msg('图片太大，请压缩后上传，最大支持1M！');
                    return false
                }

                var formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    url: '/admin/price/forum/img/upload',
                    type: 'post',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function(imgUrl) {
                        var $uploadBtn = $tbody.find('.upload');
                        var $uploadBtnParent = $uploadBtn.parent();
                        $uploadBtn.remove();
                        $uploadBtnParent.append($('<div class="imgWrap"><img src="' + imgUrl + '"/><input type="hidden" value="' + imgUrl + '"><a class="am-icon-remove removeImg" title="删除图片"></a></div>'));
                        removeImg($tbody);
                    },
                    error: function() {
                        layer.msg('图片上传失败，与服务器通信失败！');
                    }
                })
            }
            else
            {
                //Output error to older unsupported browsers that doesn't support HTML5 File API
                layer.msg('请升级您的浏览器，因为您当前的浏览器版本太低，不支持我们使用到的一些新特性！');
                return false;
            }
        })

    })
}

function removeImg($tbody) {
    $tbody.find('.removeImg').off().click(function() {
        var $imgWrap = $(this).parent();
        var $imgTd = $imgWrap.parent();
        var imgUrl = $(this).prev().val();
        var fileName = imgUrl.substring(imgUrl.lastIndexOf('/')+1);
        $.post('/admin/price/forum/img/remove', {fileName: fileName}, function(result) {
            $imgWrap.remove();
            $imgTd.append($(upload));
            uploadImg($tbody);
        })
    })
}