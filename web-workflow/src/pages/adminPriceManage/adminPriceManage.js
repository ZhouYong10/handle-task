/**
 * Created by ubuntu64 on 3/5/16.
 */
var type = '<td> ' +
    '<select class="am-form-group am-form-select type" style="color: #999;"> ' +
    '<option value="WXfans">微信公众粉丝</option> ' +
    '<option value="WXfansReply">微信粉丝回复</option> ' +
    '<option value="WXfriend">微信个人好友</option> ' +
    '<option value="WXvote">微信投票</option> ' +
    '<option value="WXcode">微信扫码</option> ' +
    '<option value="WXcodeReply">微信扫码回复</option> ' +
    '<option value="WXarticleHide">微信原文收藏</option> ' +
    '<option value="WXarticleShare">微信原文分享</option> ' +
    '<option value="WBfans">微博关注</option> ' +
    '<option value="WBvote">微博投票</option> ' +
    '<option value="WBforward">微博转发</option> ' +
    '<option value="WBread">微博阅读</option> ' +
    '<option value="WBcomment">微博评论</option> ' +
    '</select> ' +
    '</td> ';
var saveBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs save">保存</button> ';
var cancelBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs cancel">取消</button> ';
var changeSaveBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs changeSave">保存</button> ';
var giveUpBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs giveUp">放弃</button> ';
var changeBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs edit">修改</button> ';
var deleteBtn = '<button type="button" class="am-btn am-btn-primary am-radius am-btn-xs delete">删除</button> ';
var priceItem = '<tr> ' +
    '<td class="num"></td> ' +
    type+
    '<td> <input class="am-form-field am-input-sm name" type="text" placeholder="名称"> </td> ' +
    '<td> <input class="am-form-field am-input-sm adminPrice" type="text" placeholder="管理员价格"> </td> ' +
    '<td> <input class="am-form-field am-input-sm superPrice" type="text" placeholder="父级价格"> </td> ' +
    '<td> <input class="am-form-field am-input-sm childPrice" type="text" placeholder="子级价格"> </td> ' +
    '<td> <input class="am-form-field am-input-sm adminPer" type="text" placeholder="管理员占比"> </td> ' +
    '<td> <input class="am-form-field am-input-sm superPer" type="text" placeholder="父级占比"> </td> ' +
    '<td> <input class="am-form-field am-input-sm childPer" type="text" placeholder="子级占比"> </td> ' +
    '<td> ' +
    saveBtn +
    cancelBtn +
    '</td> ' +
    '</tr>';
var priceItemText = '<tr> ' +
    '<td class="num"></td> ' +
    '<td class="type"><span></span> <input type="hidden" value=""></td> ' +
    '<td class="name"> </td> ' +
    '<td class="adminPrice"> </td> ' +
    '<td class="superPrice"> </td> ' +
    '<td class="childPrice"> </td> ' +
    '<td class="adminPer"> </td> ' +
    '<td class="superPer"> </td> ' +
    '<td class="childPer"> </td> ' +
    '<td class="operation"> </td> ' +
    '</tr>';
var $changeItemTr ;

$(function () {
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

        var $newBtnParent = $newParentTr.find('.save').parent();
        $newBtnParent.children().remove();
        $newBtnParent.append($(changeSaveBtn + giveUpBtn + '<input type="hidden" value="'+$parentTr.find('.operation input').val()+'">'));

        $newParentTr.find('.num').text(num);
        $newParentTr.find('.type').val($parentTr.find('.type input').val());
        $newParentTr.find('.name').val($parentTr.find('.name').text());
        $newParentTr.find('.adminPrice').val($parentTr.find('.adminPrice').text());
        $newParentTr.find('.superPrice').val($parentTr.find('.superPrice').text());
        $newParentTr.find('.childPrice').val($parentTr.find('.childPrice').text());
        $newParentTr.find('.adminPer').val($parentTr.find('.adminPer').text());
        $newParentTr.find('.superPer').val($parentTr.find('.superPer').text());
        $newParentTr.find('.childPer').val($parentTr.find('.childPer').text());

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
    });

    $tbody.find('.delete').off().click(function () {
        var self = this;
        var $parentTd = $(self).parent();
        var $parentTr = $parentTd.parent();
        var id = $parentTd.find('input').val();
        var index = layer.confirm('您确定要删除么？', function(){
            $.post('/admin/price/manage/delete', {id: id}, function (result) {
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
            type: $tr.find('.type').val(),
            typeName: $tr.find('.type').find('option:selected').text(),
            name: $tr.find('.name').val(),
            adminPrice: $tr.find('.adminPrice').val(),
            superPrice: $tr.find('.superPrice').val(),
            childPrice: $tr.find('.childPrice').val(),
            adminPer: $tr.find('.adminPer').val(),
            superPer: $tr.find('.superPer').val(),
            childPer: $tr.find('.childPer').val()
        };
        $.post('/admin/price/manage/update', product, function() {
            var $priceItemText = $(priceItemText);
            var num = $tr.find('.num').text();

            $priceItemText.find('.num').text(num);
            $priceItemText.find('.type span').text(product.typeName);
            $priceItemText.find('.type input').val(product.type);
            $priceItemText.find('.name').text(product.name);
            $priceItemText.find('.adminPrice').text(product.adminPrice);
            $priceItemText.find('.superPrice').text(product.superPrice);
            $priceItemText.find('.childPrice').text(product.childPrice);
            $priceItemText.find('.adminPer').text(product.adminPer);
            $priceItemText.find('.superPer').text(product.superPer);
            $priceItemText.find('.childPer').text(product.childPer);
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
            type: $tr.find('.type').val(),
            typeName: $tr.find('.type').find('option:selected').text(),
            name: $tr.find('.name').val(),
            adminPrice: $tr.find('.adminPrice').val(),
            superPrice: $tr.find('.superPrice').val(),
            childPrice: $tr.find('.childPrice').val(),
            adminPer: $tr.find('.adminPer').val(),
            superPer: $tr.find('.superPer').val(),
            childPer: $tr.find('.childPer').val()
        };
        $.post('/admin/price/manage', product, function(result) {
            var $priceItemText = $(priceItemText);
            var num = $tr.find('.num').text();

            $priceItemText.find('.num').text(num);
            $priceItemText.find('.type span').text(result.typeName);
            $priceItemText.find('.type input').val(result.type);
            $priceItemText.find('.name').text(result.name);
            $priceItemText.find('.adminPrice').text(result.adminPrice);
            $priceItemText.find('.superPrice').text(result.superPrice);
            $priceItemText.find('.childPrice').text(result.childPrice);
            $priceItemText.find('.adminPer').text(result.adminPer);
            $priceItemText.find('.superPer').text(result.superPer);
            $priceItemText.find('.childPer').text(result.childPer);
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
}