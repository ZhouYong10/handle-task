/**
 * Created by zhouyong10 on 1/24/16.
 */
var User = require('../models/User');
var Product = require('../models/Product');
var Order = require('../models/Order');


var router = require('express').Router();

router.get('/like', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({userId: user._id, type: 'wb', smallType: 'like'}, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 5);
                    res.render('WBlike', {
                        title: '微博高级点赞任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/like'
                    })
                })
        });
});

router.get('/task/search/like', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wb',
                smallType: 'like',
                address: req.query.account
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('WBlike', {
                        title: '微博高级点赞任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/like'
                    })
                })
        });
});

router.get('/like/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wb', smallType: 'like'})
                .then(function(result) {
                    var resultIns = Product.wrapToInstance(result);
                    var myPrice = resultIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('WBlikeAdd', {
                            title: '添加微博高级点赞任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myPrice,
                            orderFlag: orderFlag
                        });
                    })
                });
        });
});

router.post('/like/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wb', smallType: 'like'})
                    .then(function () {
                        socketIO.emit('updateNav', {'wb': 1});
                        res.redirect('/wb/like');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wb/like');
            })
        });
});

router.get('/vote', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({userId: user._id, type: 'wb', smallType: 'vote'}, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 5);
                    res.render('WBvote', {
                        title: '微博投票任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/vote'
                    })
                })
        });
});

router.get('/task/search/vote', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wb',
                smallType: 'vote',
                address: req.query.account
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('WBvote', {
                        title: '微博投票任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/vote'
                    })
                })
        });
});

router.get('/vote/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wb', smallType: 'vote'})
                .then(function(result) {
                    var resultIns = Product.wrapToInstance(result);
                    var myPrice = resultIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('WBvoteAdd', {
                            title: '添加微博投票任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myPrice,
                            orderFlag: orderFlag
                        });
                    })
                });
        });
});

router.post('/vote/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wb', smallType: 'vote'})
                    .then(function () {
                        socketIO.emit('updateNav', {'wb': 1});
                        res.redirect('/wb/vote');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wb/vote');
            })
        });
});

router.get('/fans', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wb',
                smallType: {$in: ['fans', 'fansTwo', 'fansEight']}
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 5);
                    res.render('WBfans', {
                        title: '微博粉丝任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/fans'
                    })
                })
        });
});

router.get('/task/search/fans', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wb',
                    smallType: {$in: ['fans', 'fansTwo', 'fansEight']},
                    address: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('WBfans', {
                        title: '微博粉丝任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/fans'
                    })
                })
        });
});

router.get('/fans/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.getRandomStr(req).then(function(orderFlag) {
                res.render('WBfansAdd', {
                    title: '添加微博粉丝任务',
                    money: user.funds,
                    username: user.username,
                    userStatus: user.status,
                    role: user.role,
                    orderFlag: orderFlag
                });
            })
        });
});

router.post('/fans/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wb', smallType: order.smallType})
                    .then(function () {
                        socketIO.emit('updateNav', {'wb': 1});
                        res.redirect('/wb/fans');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wb/fans');
            })
        });
});

router.get('/get/price/by/type', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wb', smallType: req.query.type})
                .then(function(result) {
                    var productIns = Product.wrapToInstance(result);
                    var myPrice = productIns.getPriceByRole(user.role);
                    res.send({price: myPrice});
                });
        });
});

router.get('/forward', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wb',
                smallType: {$in: ['forward', 'forwardTwo', 'forwardEight']}
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 5);
                    res.render('WBforward', {
                        title: '微博转发任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/forward'
                    })
                })
        });
});

router.get('/task/search/forward', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wb',
                    smallType: {$in: ['forward', 'forwardTwo', 'forwardEight']},
                    address: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('WBforward', {
                        title: '微博转发任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WB/forward'
                    })
                })
        });
});

router.get('/forward/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.getRandomStr(req).then(function(orderFlag) {
                res.render('WBforwardAdd', {
                    title: '添加微博转发任务',
                    money: user.funds,
                    username: user.username,
                    userStatus: user.status,
                    role: user.role,
                    orderFlag: orderFlag
                });
            })
        });
});

router.post('/forward/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wb', smallType: order.smallType})
                    .then(function () {
                        socketIO.emit('updateNav', {'wb': 1});
                        res.redirect('/wb/forward');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wb/forward');
            })
        });
});

module.exports = router;