/**
 * Created by zhouyong10 on 6/3/16.
 */
$(function () {
    if($('.navTips').length) {
        $.get('/user/update/header/nav', function (obj) {
            navUpdateNum(obj);
        });

        var socket = io();
        socket.on('navUpdateNum', function (obj) {
            var orderUser = obj.orderUser;
            delete obj.orderUser;
            if($('#username').val() == orderUser){
                navUpdateNum(obj, true);
            }
        });
    }
});

function navUpdateNum(obj, isAdd) {
    for(var key in obj) {
        if(isAdd) {
            obj[key] = parseInt(obj[key]) + parseInt($('.navUpdateNum.' + key).text().split(' ')[2]);
        }
        if(obj[key] > 0) {
            $('.navTips.' + key).css('display', 'inline');
        }else {
            $('.navTips.' + key).css('display', 'none');
        }
        $('.navUpdateNum.' + key).text(' ( ' + obj[key] + ' ) ');
    }
}