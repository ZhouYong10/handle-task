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
            Order.open().findPages({userId: user._id, type: 'mp', smallType: 'like'}, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('MPlike', {
                        title: '美拍点赞任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/like'
                    })
                })
        });
});

router.get('/task/search/like', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'mp',
                smallType: 'like',
                address: req.query.account
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('MPlike', {
                        title: '美拍点赞任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/like'
                    })
                })
        });
});

router.get('/like/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'mp', smallType: 'like'})
                .then(function(like) {
                    var likeIns = Product.wrapToInstance(like);
                    var myLikePrice = likeIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('MPlikeAdd', {
                            title: '添加美拍点赞任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myLikePrice,
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
                order.createAndSave(user, {type: 'mp', smallType: 'like'})
                    .then(function () {
                        socketIO.emit('updateNav', {'mp': 1});
                        res.redirect('/mp/like');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/mp/like');
            })
        });
});

router.get('/comment', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({userId: user._id, type: 'mp', smallType: 'comment'}, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('MPcomment', {
                        title: '美拍评论任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/comment'
                    })
                })
        });
});

router.get('/task/search/comment', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'mp',
                smallType: 'comment',
                address: req.query.account
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('MPcomment', {
                        title: '美拍评论任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/comment'
                    })
                })
        });
});

router.get('/comment/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'mp', smallType: 'comment'})
                .then(function(comment) {
                    var commentIns = Product.wrapToInstance(comment);
                    var myCommentPrice = commentIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('MPcommentAdd', {
                            title: '添加美拍评论任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myCommentPrice,
                            orderFlag: orderFlag
                        });
                    })
                });
        });
});

router.post('/comment/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'mp', smallType: 'comment'})
                    .then(function () {
                        socketIO.emit('updateNav', {'mp': 1});
                        res.redirect('/mp/comment');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/mp/comment');
            })
        });
});

router.get('/attention', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({userId: user._id, type: 'mp', smallType: 'attention'}, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('MPattention', {
                        title: '美拍关注任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/attention'
                    })
                })
        });
});

router.get('/task/search/attention', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'mp',
                smallType: 'attention',
                address: req.query.account
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('MPattention', {
                        title: '美拍关注任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/attention'
                    })
                })
        });
});

router.get('/attention/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'mp', smallType: 'attention'})
                .then(function(attention) {
                    var attentionIns = Product.wrapToInstance(attention);
                    var myAttentionPrice = attentionIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('MPattentionAdd', {
                            title: '添加美拍关注任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myAttentionPrice,
                            orderFlag: orderFlag
                        });
                    })
                });
        });
});

router.post('/attention/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'mp', smallType: 'attention'})
                    .then(function () {
                        socketIO.emit('updateNav', {'mp': 1});
                        res.redirect('/mp/attention');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/mp/attention');
            })
        });
});

router.get('/forward', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({userId: user._id, type: 'mp', smallType: 'forward'}, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('MPforward', {
                        title: '美拍转发任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/forward'
                    })
                })
        });
});

router.get('/task/search/forward', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'mp',
                smallType: 'forward',
                address: req.query.account
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('MPforward', {
                        title: '美拍转发任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/MP/forward'
                    })
                })
        });
});

router.get('/forward/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'mp', smallType: 'forward'})
                .then(function(forward) {
                    var forwardIns = Product.wrapToInstance(forward);
                    var myForwardPrice = forwardIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('MPforwardAdd', {
                            title: '添加美拍转发任务',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myForwardPrice,
                            orderFlag: orderFlag
                        });
                    })
                });
        });
});

router.post('/forward/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(req.body);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'mp', smallType: 'forward'})
                    .then(function () {
                        socketIO.emit('updateNav', {'mp': 1});
                        res.redirect('/mp/forward');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/mp/forward');
            })
        });
});


module.exports = router;