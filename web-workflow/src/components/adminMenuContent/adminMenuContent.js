/**
 * Created by ubuntu64 on 3/3/16.
 */
$(function () {
    $.get('/admin/update/header/nav', function (obj) {
        updateNav(obj);
    });

    var socket = io();
    socket.on('updateNav', function (obj) {
        updateNav(obj, true);
    });
});

function updateNav(obj, isAdd) {
    for(var key in obj) {
        if(isAdd) {
            obj[key] = parseInt(obj[key]) + parseInt($('.updateNum.' + key).text().split(' ')[2]);
        }
        if(obj[key] > 0) {
            $('.tips.' + key).css('display', 'inline');
        }else {
            $('.tips.' + key).css('display', 'none');
        }
        $('.updateNum.' + key).text(' ( ' + obj[key] + ' ) ');
    }

    var waitHT = parseInt($('.updateNum.waitHT').text().split(' ')[2]);
    var complaintHT = parseInt($('.updateNum.complaintHT').text().split(' ')[2]);
    var htNum = waitHT + complaintHT;
    if(htNum > 0) {
        $('.tips.waitHT.complaintHT').css('display', 'inline');
    }

    //var wxArticle = parseInt($('.updateNum.wxArticle').text().split(' ')[2]);
    var wxLikeQuick = parseInt($('.updateNum.wxLikeQuick').text().split(' ')[2]);
    var wxLike = parseInt($('.updateNum.wxLike').text().split(' ')[2]);
    var wxComment = parseInt($('.updateNum.wxComment').text().split(' ')[2]);
    var wxReply = parseInt($('.updateNum.wxReply').text().split(' ')[2]);
    var wxFriend = parseInt($('.updateNum.wxFriend').text().split(' ')[2]);
    //var wxCode = parseInt($('.updateNum.wxCode').text().split(' ')[2]);
    //var wxNum = wxArticle + wxLikeQuick + wxLike + wxComment + wxReply + wxFriend + wxCode;
    var wxNum = wxLikeQuick + wxLike + wxComment + wxReply + wxFriend;
    if(wxNum > 0) {
        $('.tips.wxArticle.wxLikeQuick.wxLike.wxComment.wxReply.wxFriend.wxCode').css('display', 'inline');
    }
}