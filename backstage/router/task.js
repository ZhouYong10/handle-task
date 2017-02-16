/**
 * Created by ubuntu64 on 5/11/16.
 */
var User = require('../models/User');
var Order = require('../models/Order');
var Task = require('../models/Task');

var router = require('express').Router();


router.get('/all', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    type: 'handle',
                    status: '已发布',
                    taskUsers: {$not: {$all: [user._id]}}
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskAll', {
                        title: '任务大厅',
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

router.get('/type', function (req, res) {
    var smallType = req.query.type;
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    type: 'handle',
                    smallType: smallType,
                    status: '已发布',
                    taskUsers: {$not: {$all: [user._id]}}
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskAll', {
                        title: '任务大厅',
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

router.get('/show', function (req, res) {
    var orderId = req.query.id;
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            if(user.taskAccount && user.taskName){
                Order.open().findById(orderId)
                    .then(function(order) {
                        Task.getRandomStr(req).then(function(orderFlag) {
                            res.render('handleTaskShow', {
                                money: user.funds,
                                role: user.role,
                                userStatus: user.status,
                                username: user.username,
                                order: order,
                                orderFlag: orderFlag
                            });
                        })
                    })
            }else{
                req.session.msg = '请填写您做任务的微信账户信息!';
                res.redirect('/task/account');
            }
        });
});

router.post('/show', function (req, res) {
    Order.getOrder(req).then(function (info) {
        info.userId = req.session.passport.user;
        Task.checkRandomStr(req, info).then(function() {
            Task.createTask(info).then(function(task) {
                socketIO.emit('navUpdateNum', {'checks': 1, 'orderUser': task.user});
                res.redirect('/task/all');
            }, function(err) {
                res.send('<h1>'+err+'</h1>'); //各种错误
            })
        }, function(msg) {
            res.redirect('/task/all');
        })
    }, function(err) {
        res.send('<h1>'+err+'</h1>'); //各种错误
    });
});

router.get('/alre', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    taskUserId: user._id
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskAlre', {
                        title: '我做过的任务',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages
                    });
                });
        });
});

router.get('/search/task', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var query = {taskUserId: user._id};
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
            Task.open().findPages(query, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskAlre', {
                        title: '我做过的任务',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages
                    });
                }, function (error) {
                    res.send('查询记录失败： ' + error);
                });
        });
});

router.get('/complaints', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    taskUserId: user._id,
                    taskStatus: '被投诉'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskComplaints', {
                        title: '我被投诉的任务',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages
                    });
                });
        });
});

router.get('/complaints/alre', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    taskUserId: user._id,
                    taskStatus: {$in: ['投诉成立', '投诉不成立']}
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskComplaintsAlre', {
                        title: '已处理的投诉任务',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages
                    });
                });
        });
});

router.get('/account', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            res.render('handleTaskAccount', {
                title: '我做任务的微信账户',
                money: user.funds,
                user: user,
                username: user.username,
                userStatus: user.status,
                role: user.role,
                message: req.session.msg ? req.session.msg : ''
            });
        }, function (error) {
            res.send('获取用户详细信息失败： ' + error);
        });
});

router.post('/account', function (req, res) {
    var update = req.body;
    User.open().updateById(req.session.passport.user, {
        $set: {
            taskAccount: update.taskAccount,
            taskName: update.taskName
        }
    }).then(function (user) {
        delete req.session.msg;
        res.redirect('/task/account');
    }, function (error) {
        res.send('更新用户信息失败： ' + error);
    });
});

router.get('/new/tasker/have/look', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            res.render('handleTaskerLook', {
                title: '新手必看',
                money: user.funds,
                user: user,
                username: user.username,
                userStatus: user.status,
                role: user.role
            });
        }, function (error) {
            res.send('获取用户详细信息失败： ' + error);
        });
});

module.exports = router;
