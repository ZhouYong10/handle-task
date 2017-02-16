/**
 * Created by zhouyong10 on 1/25/16.
 */
/**
 * Created by zhouyong10 on 1/24/16.
 */
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

function postForumOrder(obj) {
    return new Promise(function (resolve, reject) {
        var val = '86867555,WDY13419085703,' + moment().format('YYYY-MM-DD HH:mm:ss');
        request({
            url: 'http://data.ht4rz.com/Service1.asmx/MakeKey?val='+ val +'&key=ts32%23df3'
        }, function (err, res, body) {
            if (err) {
                reject(err);
            } else {
                var $ = cheerio.load(body);
                var key = $('string').text();
                var url = 'http://data.ht4rz.com/Service1.asmx/SendContent?key=' + key
                    + '&address=' + encodeURIComponent(obj.address) + encodeURI('&startime=' + obj.startTime + '&min=' + obj.min
                    + '&max=' + obj.max + '&contents=' + obj.content);
                request({
                    url: url
                }, function(err, res, body) {
                    var $ = cheerio.load(body);
                    try{
                        var result = JSON.parse($('string').text());
                        if(result.flag == 'true') {
                            obj.timetick = result.timetick;
                            resolve(obj);
                        }else {
                            reject(JSON.stringify(result));
                        }
                    }catch (e){
                        reject($('string').text() + e);
                    }
                })
            }
        });
    });
}


var Product = require('../models/Product');
var User = require('../models/User');
var Order = require('../models/Order');

var router = require('express').Router();

router.get('/create/task', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.getRandomStr(req).then(function(orderFlag) {
                res.render('forumTemplate', {
                    title: '论坛回复任务',
                    money: user.funds,
                    role: user.role,
                    userStatus: user.status,
                    username: user.username,
                    orderFlag: orderFlag
                })
            })
        });
});

router.post('/comment/add', function (req, res) {
    var orderInfo = req.body;
    postForumOrder(orderInfo).then(function (obj) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var order = Order.wrapToInstance(obj);
                order.checkRandomStr(req).then(function() {
                    order.createAndSave(user, {type: 'forum', smallType: obj.smallType})
                        .then(function (copResult) {
                            copResult.complete(function () {
                                socketIO.emit('updateNav', {'reply': 1});
                                res.redirect('/forum/taskHistory');
                            });
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/forum/taskHistory');
                })
            });
    }, function (msg) {
        res.send(msg);
    });
});

router.get('/taskHistory', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'forum'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 1);
                    res.render('forumTaskHistory', {
                        title: '论坛业务历史记录',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/forum/taskHistory'
                    });
                });
        });
});

router.get('/search/forum', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var query = {userId: user._id, type: 'forum'};
            var titleOrAds = req.query.titleOrAds;
            if (titleOrAds) {
                if(titleOrAds.indexOf('http://') != -1) {
                    query.address = titleOrAds;
                }else {
                    query.title = new RegExp(titleOrAds);
                }
            }
            if (req.query.createTime) {
                query.createTime = new RegExp(req.query.createTime);
            }
            Order.open().findPages(query, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 1);
                    res.render('forumTaskHistory', {
                        title: '论坛业务历史记录',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/forum/taskHistory'
                    });
                }, function (error) {
                    res.send('查询记录失败： ' + error);
                });
        });
});

module.exports = router;