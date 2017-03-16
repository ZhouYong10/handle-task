/**
 * Created by ubuntu64 on 5/11/16.
 */
var User = require('../models/User');
var Order = require('../models/Order');
var Product = require('../models/Product');
var Task = require('../models/Task');

var moment = require('moment');
var path = require('path');
var router = require('express').Router();



Object.defineProperty(global, 'handleExam', {
    value: path.join(__dirname, '../public/handle_example/'),
    writable: false,
    configurable: false
});

router.get('/WX/fans', function (req, res) {
    var obj = {
        type: 'WXfans'
    };
    if(req.query.account) {
        obj.account = new RegExp(req.query.account);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('taskerWXfans', {
                        title: '微信粉丝(回复)',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/tasker/WX/fans'
                    })
                })
        });
});

router.get('/WX/fans/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'WXfans'})
                .then(function(fansP) {
                    var fans = Product.wrapToInstance(fansP);
                    var fansPrice = fans.getPriceByUser(user);
                    Product.open().findOne({type: 'WXfansReply'})
                        .then(function(replyP) {
                            var reply = Product.wrapToInstance(replyP);
                            var replyPrice = reply.getPriceByUser(user);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('taskerWXfansAdd', {
                                    title: '添加微信粉丝(回复)任务',
                                    user: user,
                                    fansPrice: fansPrice,
                                    replyPrice: replyPrice,
                                    orderFlag: orderFlag
                                })
                            })
                        });
                });
        });
});

router.post('/WX/fans/add', function (req, res) {
    Order.getOrder(req).then(function (order) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    if(orderIns.isTow) {
                        orderIns.createTwo(user, {type: 'WXfans'}, {type: 'WXfansReply'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/tasker/WX/fans');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }else {
                        delete orderIns.price2;
                        orderIns.createOne(user, {type: 'WXfans'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/tasker/WX/fans');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }
                }, function(msg) {
                    res.redirect('/tasker/WX/fans');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});


router.get('/WX/friend', function (req, res) {
    var obj = {
        type: 'WXfriend'
    };
    if(req.query.account) {
        obj.account = new RegExp(req.query.account);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('taskerWXfriend', {
                        title: '微信个人好友',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/tasker/WX/friend'
                    })
                })
        });
});

router.get('/WX/friend/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'WXfriend'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByUser(user);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('taskerWXfriendAdd', {
                            title: '添加微信个人好友任务',
                            user: user,
                            fansPrice: fansPrice,
                            orderFlag: orderFlag
                        })
                    })
                });
        });
});

router.post('/WX/friend/add', function (req, res) {
    Order.getOrder(req).then(function (order) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    orderIns.createOne(user, {type: 'WXfriend'})
                        .then(function () {
                            socketIO.emit('updateNav', {'waitHT': 1});
                            res.redirect('/tasker/WX/friend');
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/tasker/WX/friend');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});

router.get('/WX/vote', function (req, res) {
    var obj = {
        type: 'WXvote'
    };
    if(req.query.address) {
        obj.address = new RegExp(req.query.address);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 10);
                    res.render('taskerWXvote', {
                        title: '微信投票',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/tasker/WX/vote'
                    })
                })
        });
});

router.get('/WX/vote/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'WXvote'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByUser(user);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('taskerWXvoteAdd', {
                            title: '添加微信投票任务',
                            user: user,
                            fansPrice: fansPrice,
                            orderFlag: orderFlag
                        })
                    })
                });
        });
});

router.post('/WX/vote/add', function (req, res) {
    Order.getOrder(req).then(function (order) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    orderIns.createOne(user, {type: 'WXvote'})
                        .then(function () {
                            socketIO.emit('updateNav', {'waitHT': 1});
                            res.redirect('/tasker/WX/vote');
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/tasker/WX/vote');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});


router.get('/WX/code', function (req, res) {
    var obj = {
        type: 'WXcode'
    };
    if(req.query.account) {
        obj.account = new RegExp(req.query.account);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('taskerWXcode', {
                        title: '微信扫码(回复)',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/tasker/WX/code'
                    })
                })
        });
});

router.get('/WX/code/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'WXcode'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByUser(user);
                    Product.open().findOne({type: 'WXcodeReply'})
                        .then(function(result) {
                            var reply = Product.wrapToInstance(result);
                            var replyPrice = reply.getPriceByUser(user);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('taskerWXcodeAdd', {
                                    title: '添加微信扫码(回复)任务',
                                    user: user,
                                    fansPrice: fansPrice,
                                    replyPrice: replyPrice,
                                    orderFlag: orderFlag
                                })
                            })
                        });
                });
        });
});

router.post('/WX/code/add', function (req, res) {
    Order.getOrder(req).then(function (order) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    if(orderIns.isTow) {
                        orderIns.createTwo(user, {type: 'WXcode'}, {type: 'WXcodeReply'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/tasker/WX/code');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }else {
                        delete orderIns.price2;
                        orderIns.createOne(user, {type: 'WXcode'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/tasker/WX/code');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }
                }, function(msg) {
                    res.redirect('/tasker/WX/code');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});


router.get('/WX/article', function (req, res) {
    var obj = {
        type: 'WXarticleShare'
    };
    if(req.query.address) {
        obj.address = new RegExp(req.query.address);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('taskerWXarticle', {
                        title: '微信原文/收藏/分享',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/tasker/WX/article'
                    })
                })
        });
});

router.get('/WX/article/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'WXarticleShare'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByUser(user);
                    Product.open().findOne({type: 'WXarticleHide'})
                        .then(function(result) {
                            var reply = Product.wrapToInstance(result);
                            var replyPrice = reply.getPriceByUser(user);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('taskerWXarticleAdd', {
                                    title: '添加微信原文/收藏/分享任务',
                                    user: user,
                                    fansPrice: fansPrice,
                                    replyPrice: replyPrice,
                                    orderFlag: orderFlag
                                })
                            })
                        });
                });
        });
});

router.post('/WX/article/add', function (req, res) {
    Order.getOrder(req).then(function (order) {
        order.num2 = order.num;
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    if(orderIns.isTow) {
                        orderIns.createTwo(user, {type: 'WXarticleShare'}, {type: 'WXarticleHide'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/tasker/WX/article');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }else {
                        delete orderIns.price2;
                        orderIns.createOne(user, {type: 'WXarticleShare'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/tasker/WX/article');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }
                }, function(msg) {
                    res.redirect('/tasker/WX/article');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});

router.get('/order/details', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    orderId: req.query.orderId
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('taskerOrderDetails', {
                        title: '人工平台 / 任务进度详情',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        msg: req.query.msg
                    })
                });
        });
});

router.get('/check', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    userId: user._id,
                    taskStatus: '待审核'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('taskerCheck', {
                        title: '人工平台 / 待验收任务',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/tasker/check'
                    })
                });
        });
});

router.get('/check/success', function (req, res) {
    Task.open().findById(req.query.taskId).then(function(task) {
        var taskIns = Task.wrapToInstance(task);
        taskIns.success().then(function() {
            res.redirect('/tasker/check');
        })
    })
});

router.get('/check/complaints', function (req, res) {
    var info = req.query;
    Task.open().findById(info.taskId).then(function(task) {
        Task.open().updateById(info.taskId, {$set: {
            taskStatus: '被投诉',
            complaintsInfo: info.info,
            complaintsTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }}).then(function() {
            socketIO.emit('updateNav', {'complaintHT': 1});
            res.redirect('/tasker/check');
        })
    })
});

router.get('/complaint', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    userId: user._id,
                    taskStatus: {$in: ['被投诉', '投诉成立', '投诉不成立']}
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('taskerComplaints', {
                        title: '人工平台 / 我投诉的任务',
                        user: user,
                        orders: obj.results,
                        pages: obj.pages
                    })
                });
        });
});

router.get('/order/pause', function (req, res) {
    Order.open().updateById(req.query.id, {$set: {
        status: '已暂停'
    }}).then(function() {
        res.redirect(req.query.path);
    })
});

router.get('/order/start', function (req, res) {
    Order.open().updateById(req.query.id, {$set: {
        status: '已发布'
    }}).then(function() {
        res.redirect(req.query.path);
    })
});

router.get('/order/refund', function (req, res) {
    Task.open().find({
        orderId: req.query.id,
        taskStatus: {$in: ['待审核', '被投诉']}
    }).then(function(tasks) {
        if(tasks.length > 0) {
            res.redirect('/tasker/order/details?orderId=' + req.query.id + encodeURI('&msg=存在待审核或被投诉未处理任务，不能取消当前发布的任务！'));
        }else {
            Order.open().findById(req.query.id).then(function(order) {
                Order.open().updateById(order._id, {$set: {
                    status: '已退款',
                    surplus: 0
                }}).then(function() {
                    User.open().findById(order.userId).then(function(user) {
                        var funds = (parseFloat(user.funds) + parseFloat(order.surplus)).toFixed(4);
                        User.open().updateById(user._id, {$set: {
                            funds: funds
                        }}).then(function() {
                            res.redirect(req.query.path);
                        })
                    })
                })
            })
        }
    })
});

router.get('/look', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            res.render('taskerLook', {
                title: '发布必看',
                user: user
            });
        }, function (error) {
            res.send('获取用户详细信息失败： ' + error);
        });
});


module.exports = router;