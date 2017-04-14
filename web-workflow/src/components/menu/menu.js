/**
 * Created by zhouyong10 on 6/3/16.
 */
$(function () {
    $.get('/user/update/header/nav', function (obj) {
        console.log(obj, '==================');
        navUpdateNum(obj);
    });

    var socket = io();
    socket.on('navUpdateNum', function (obj) {
        console.log(obj, '000000000000000000000000000000000000');
        var orderUser = obj.orderUser;
        delete obj.orderUser;
        console.log(orderUser, '1111111111111111111111111111111111');
        console.log($('#username').val(), '2222222222222222222222222222222222');
        console.log($('#username').val() == orderUser, '==================================');
        if($('#username').val() == orderUser){
            navUpdateNum(obj, true);
        }
    });
});

function navUpdateNum(obj, isAdd) {
    for(var key in obj) {
        if(isAdd) {
            obj[key] = parseInt(obj[key]) + parseInt($('.updateNum.' + key).first().text());
        }
        if(obj[key] > 0) {
            $('.tips.' + key).css('display', 'inline');
            $('.updateNum.' + key).text(obj[key]).css('display', 'inline');
        }else {
            $('.tips.' + key).css('display', 'none');
            $('.updateNum.' + key).css('display', 'none');
        }
    }
}