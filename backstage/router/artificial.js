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

router.get('/WX/fans', function (req, res) {
    var obj = {
        type: 'handle',
        smallType: 'WXfans'
    };
    if(req.query.account) {
        obj.account = new RegExp(req.query.account);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('handleWXfans', {
                        title: '人工微信粉丝(回复)',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/artificial/WX/fans'
                    })
                })
        });
});

router.get('/WX/fans/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'handle', smallType: 'WXfans'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByRole(user.role);
                    Product.open().findOne({type: 'handle', smallType: 'WXfansReply'})
                        .then(function(result) {
                            var reply = Product.wrapToInstance(result);
                            var replyPrice = reply.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('handleWXfansAdd', {
                                    title: '添加人工微信粉丝(回复)任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    fansPrice: fansPrice,
                                    replyPrice: replyPrice,
                                    orderFlag: orderFlag
                                })
                            })
                        });
                });
        });
});

Object.defineProperty(global, 'handleExam', {
    value: path.join(__dirname, '../public/handle_example/'),
    writable: false,
    configurable: false
});

router.post('/WX/fans/add', function (req, res) {
    Order.getOrder(req).then(function (order) {
        order.num2 = order.num;
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    if(orderIns.isTow) {
                        orderIns.handleCreateAndSaveTwo(user, {type: 'handle', smallType: 'WXfans'}, {type: 'handle', smallType: 'WXfansReply'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/artificial/WX/fans');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }else {
                        delete orderIns.price2;
                        orderIns.handleCreateAndSave(user, {type: 'handle', smallType: 'WXfans'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/artificial/WX/fans');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }
                }, function(msg) {
                    res.redirect('/artificial/WX/fans');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});


router.get('/WX/friend', function (req, res) {
    var obj = {
        type: 'handle',
        smallType: 'WXfriend'
    };
    if(req.query.account) {
        obj.account = new RegExp(req.query.account);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('handleWXfriend', {
                        title: '人工微信个人好友',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/artificial/WX/friend'
                    })
                })
        });
});

router.get('/WX/friend/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'handle', smallType: 'WXfriend'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('handleWXfriendAdd', {
                            title: '添加人工微信个人好友任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
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
                    orderIns.handleCreateAndSave(user, {type: 'handle', smallType: 'WXfriend'})
                        .then(function () {
                            socketIO.emit('updateNav', {'waitHT': 1});
                            res.redirect('/artificial/WX/friend');
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/artificial/WX/friend');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});

router.get('/WX/vote', function (req, res) {
    var obj = {
        type: 'handle',
        smallType: 'WXvote'
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
                    res.render('handleWXvote', {
                        title: '人工微信投票',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/artificial/WX/vote'
                    })
                })
        });
});

router.get('/WX/vote/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'handle', smallType: 'WXvote'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('handleWXvoteAdd', {
                            title: '添加人工微信投票任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
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
                    orderIns.handleCreateAndSave(user, {type: 'handle', smallType: 'WXvote'})
                        .then(function () {
                            socketIO.emit('updateNav', {'waitHT': 1});
                            res.redirect('/artificial/WX/vote');
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/artificial/WX/vote');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});


router.get('/WX/code', function (req, res) {
    var obj = {
        type: 'handle',
        smallType: 'WXcode'
    };
    if(req.query.account) {
        obj.account = new RegExp(req.query.account);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('handleWXcode', {
                        title: '人工微信扫码(回复)',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/artificial/WX/code'
                    })
                })
        });
});

router.get('/WX/code/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'handle', smallType: 'WXcode'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByRole(user.role);
                    Product.open().findOne({type: 'handle', smallType: 'WXcodeReply'})
                        .then(function(result) {
                            var reply = Product.wrapToInstance(result);
                            var replyPrice = reply.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('handleWXcodeAdd', {
                                    title: '添加人工微信扫码(回复)任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
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
        order.num2 = order.num;
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                var orderIns = Order.wrapToInstance(order);
                orderIns.checkRandomStr(req).then(function() {
                    if(orderIns.isTow) {
                        orderIns.handleCreateAndSaveTwo(user, {type: 'handle', smallType: 'WXcode'}, {type: 'handle', smallType: 'WXcodeReply'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/artificial/WX/code');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }else {
                        delete orderIns.price2;
                        orderIns.handleCreateAndSave(user, {type: 'handle', smallType: 'WXcode'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/artificial/WX/code');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }
                }, function(msg) {
                    res.redirect('/artificial/WX/code');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});


router.get('/WX/article', function (req, res) {
    var obj = {
        type: 'handle',
        smallType: 'WXarticleShare'
    };
    if(req.query.address) {
        obj.address = new RegExp(req.query.address);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            obj.userId = user._id;
            Order.open().findPages(obj, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    res.render('handleWXarticle', {
                        title: '人工微信原文/收藏/分享',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/artificial/WX/article'
                    })
                })
        });
});

router.get('/WX/article/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'handle', smallType: 'WXarticleShare'})
                .then(function(result) {
                    var fans = Product.wrapToInstance(result);
                    var fansPrice = fans.getPriceByRole(user.role);
                    Product.open().findOne({type: 'handle', smallType: 'WXarticleHide'})
                        .then(function(result) {
                            var reply = Product.wrapToInstance(result);
                            var replyPrice = reply.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('handleWXarticleAdd', {
                                    title: '添加人工微信原文/收藏/分享任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
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
                        orderIns.handleCreateAndSaveTwo(user, {type: 'handle', smallType: 'WXarticleShare'}, {type: 'handle', smallType: 'WXarticleHide'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/artificial/WX/article');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }else {
                        delete orderIns.price2;
                        orderIns.handleCreateAndSave(user, {type: 'handle', smallType: 'WXarticleShare'})
                            .then(function () {
                                socketIO.emit('updateNav', {'waitHT': 1});
                                res.redirect('/artificial/WX/article');
                            }, function() {
                                res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                            });
                    }
                }, function(msg) {
                    res.redirect('/artificial/WX/article');
                })
            });
    }, function(err) {
        res.end('提交表单失败： ',err); //各种错误
    });
});

router.get('/task/details', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    orderId: req.query.orderId
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleOrderTasks', {
                        title: '人工平台 / 任务进度详情',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        msg: req.query.msg
                    })
                });
        });
});

router.get('/task/check', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    userId: user._id,
                    taskStatus: '待审核'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskCheck', {
                        title: '人工平台 / 待验收任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/artificial/task/check'
                    })
                });
        });
});

router.get('/task/check/success', function (req, res) {
    Task.open().findById(req.query.taskId).then(function(task) {
        var taskIns = Task.wrapToInstance(task);
        taskIns.success().then(function() {
            res.redirect('/artificial/task/check');
        })
    })
});

router.get('/task/check/complaints', function (req, res) {
    var info = req.query;
    Task.open().findById(info.taskId).then(function(task) {
        Task.open().updateById(info.taskId, {$set: {
            taskStatus: '被投诉',
            complaintsInfo: info.info,
            complaintsTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }}).then(function() {
            socketIO.emit('updateNav', {'complaintHT': 1});
            res.redirect('/artificial/task/check');
        })
    })
});

router.get('/task/complaint', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Task.open().findPages({
                    userId: user._id,
                    taskStatus: {$in: ['被投诉', '投诉成立', '投诉不成立']}
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    res.render('handleTaskComplaintsAlre', {
                        title: '人工平台 / 我投诉的任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
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
            res.redirect('/artificial/task/details?orderId=' + req.query.id + encodeURI('&msg=存在待审核或被投诉未处理任务，不能取消当前发布的任务！'));
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

router.get('/release/have/look', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            res.render('handleReleaseLook', {
                title: '发布必看',
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