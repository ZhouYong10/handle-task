/**
 * Created by zhouyong10 on 1/24/16.
 */

var User = require('../models/User');
var Product = require('../models/Product');
var Order = require('../models/Order');

var moment = require('moment');
var Formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var router = require('express').Router();

Object.defineProperty(global, 'codeDir', {
    value: path.join(__dirname, '../public/codes/'),
    writable: false,
    configurable: false
});

router.get('/friend', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wx',
                smallType: 'friend'
            }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results, 10);
                    res.render('WXfriend', {
                        title: '公众粉丝(1000以上)',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/friend'
                    })
                })
        });
});

router.get('/account/search/friend', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'friend',
                    account: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function(obj) {
                    Order.addSchedule(obj.results);
                    res.render('WXfriend', {
                        title: '公众粉丝(1000以上)',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/friend'
                    })
                })
        });
});

router.get('/friend/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'friend'})
                .then(function(result) {
                    var product = Product.wrapToInstance(result);
                    var myPrice = product.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('WXfriendAdd', {
                            title: '添加公众粉丝(1000以上)',
                            money: user.funds,
                            username: user.username,
                            userStatus: user.status,
                            role: user.role,
                            price: myPrice,
                            orderFlag: orderFlag
                        })
                    })
                });
        });
});

router.post('/friend/add', function (req, res) {
    var orderInfo = req.body;
    if(!orderInfo.account){
        return res.send('<h1>微信公众平台账号或ID不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(!orderInfo.num || !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) || orderInfo < 1000) {
        return res.send('<h1>需要添加的粉丝数量不能为空,且必须是正整数， 最低1000起.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }

    orderInfo.account = orderInfo.account.replace(/(^\s*)|(\s*$)/g, "");
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wx', smallType: 'friend'})
                    .then(function () {
                        socketIO.emit('updateNav', {'wxFriend': 1});
                        res.redirect('/wx/friend');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！!</h1>')
                    });
            }, function(msg) {
                res.redirect('/wx/friend');
            })
        });
});

router.get('/fans', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wx',
                smallType: 'fans'
            }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 10);
                    res.render('WXfans', {
                        title: '公众粉丝(1000以下)',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/fans'
                    })
                });
        });
});

router.get('/account/search/fans', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'fans',
                    account: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results);
                    res.render('WXfans', {
                        title: '公众粉丝(1000以下)',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/fans'
                    })
                });
        });
});

router.get('/fans/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'fans'})
                .then(function(fans) {
                    var fansIns = Product.wrapToInstance(fans);
                    var myFansPrice = fansIns.getPriceByRole(user.role);
                    Product.open().findOne({type: 'wx', smallType: 'fansReply'})
                        .then(function(reply) {
                            var replyIns = Product.wrapToInstance(reply);
                            var myReplyPrice = replyIns.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('WXfansAdd', {
                                    title: '添加公众粉丝(1000以下)',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    fansPrice: myFansPrice,
                                    replyPrice: myReplyPrice,
                                    orderFlag: orderFlag
                                });
                            })
                        });
                });
        });
});

router.post('/fans/add', function (req, res) {
    var orderInfo = req.body;
    if(!orderInfo.account){
        return res.send('<h1>微信公众平台账号或ID不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(!orderInfo.num || !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) || orderInfo < 100) {
        return res.send('<h1>需要添加的粉丝数量不能为空,且必须是正整数， 最低100起.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }

    orderInfo.account = orderInfo.account.replace(/(^\s*)|(\s*$)/g, "");
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wx', smallType: 'fans'})
                    .then(function () {
                        socketIO.emit('updateNav', {'wxReply': 1});
                        res.redirect('/wx/fans');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wx/fans');
            })
        });
});

router.get('/share', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wx',
                smallType: {$in: ['article', 'share', 'collect']}
            }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('WXshare', {
                        title: '微信原文/分享/收藏',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/share'
                    });
                });
        });
});

router.get('/account/search/share', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: {$in: ['article', 'share', 'collect']},
                    address: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results);
                    res.render('WXshare', {
                        title: '微信原文/分享/收藏',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/share'
                    });
                });
        });
});

router.get('/share/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.getRandomStr(req).then(function(orderFlag) {
                res.render('WXshareAdd', {
                    title: '添加微信原文/分享/收藏任务',
                    money: user.funds,
                    username: user.username,
                    userStatus: user.status,
                    role: user.role,
                    orderFlag: orderFlag
                });
            })
        });
});

router.post('/share/add', function (req, res) {
    var orderInfo = req.body;
    if(!orderInfo.smallType){
        return res.send('<h1>需要提交的任务类型不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(!orderInfo.address){
        return res.send('<h1>任务地址不能为空不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(!orderInfo.num || !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) || orderInfo < 30) {
        return res.send('<h1>需要添加的粉丝数量不能为空,且必须是正整数， 最低30起.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }

    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wx', smallType: orderInfo.smallType})
                    .then(function () {
                        socketIO.emit('updateNav', {'wxArticle': 1});
                        res.redirect('/wx/share');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wx/share');
            })
        });
});

router.get('/get/price/by/type', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: req.query.type})
                .then(function(result) {
                    var productIns = Product.wrapToInstance(result);
                    var myPrice = productIns.getPriceByRole(user.role);
                    res.send({price: myPrice});
                });
        });
});

router.get('/like', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                userId: user._id,
                type: 'wx',
                smallType: 'read'
            }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('WXlike', {
                        title: '图文阅读/点赞',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/like'
                    })
                });
        });
});

router.get('/account/search/like', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'read',
                    address: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results);
                    res.render('WXlike', {
                        title: '图文阅读/点赞',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/like'
                    })
                });
        });
});

router.get('/like/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'read'})
                .then(function(read) {
                    var readIns = Product.wrapToInstance(read);
                    var myReadPrice = readIns.getPriceByRole(user.role);
                    Product.open().findOne({type: 'wx', smallType: 'like'})
                        .then(function(like) {
                            var likeIns = Product.wrapToInstance(like);
                            var myLikePrice = likeIns.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('WXlikeAdd', {
                                    title: '添加微信图文阅读点赞任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    price: myReadPrice,
                                    price2: myLikePrice,
                                    orderFlag: orderFlag
                                });
                            })
                        });
                });
        });
});

router.post('/like/add', function (req, res) {
    var orderInfo = req.body;
    if(!orderInfo.address){
        return res.send('<h1>任务地址不能为空不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(!orderInfo.num || !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) || orderInfo < 500) {
        return res.send('<h1>需要添加的粉丝数量不能为空,且必须是正整数， 最低500起.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(orderInfo.num2 && !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) && orderInfo.num2 > (orderInfo.num *3/100)) {
        return res.send('<h1>点赞数量必须为正整数,且不能大于阅读数量的3%!.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }

    orderInfo.num = parseInt(orderInfo.num);
    if(orderInfo.num2 == ''){
        orderInfo.num2 = parseInt(orderInfo.num * 5 / 1000);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {

            var order = Order.wrapToInstance(orderInfo);
            if(orderInfo.orderFlag) {
                order.checkRandomStr(req).then(function() {
                    order.createAndSaveTwo(user, {type: 'wx', smallType: 'read'}, {type: 'wx', smallType: 'like'})
                        .then(function () {
                            socketIO.emit('updateNav', {'wxLike': 1});
                            res.redirect('/wx/like');
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/wx/like');
                })
            }else {
                order.createAndSaveTwo(user, {type: 'wx', smallType: 'read'}, {type: 'wx', smallType: 'like'})
                    .then(function (result) {
                        socketIO.emit('updateNav', {'wxLike': 1});
                        res.send({funds: result.funds, msg: '提交成功！'});
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }
        });
});

router.get('/like/bulk/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'read'})
                .then(function(read) {
                    var readIns = Product.wrapToInstance(read);
                    var myReadPrice = readIns.getPriceByRole(user.role);
                    Product.open().findOne({type: 'wx', smallType: 'like'})
                        .then(function(like) {
                            var likeIns = Product.wrapToInstance(like);
                            var myLikePrice = likeIns.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('WXlikeBulkAdd', {
                                    title: '批量添加微信图文阅读点赞任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    price: myReadPrice,
                                    price2: myLikePrice,
                                    orderFlag: orderFlag
                                });
                            })
                        });
                });
        });
});





router.get('/like/quick', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'readQuick',
                    quick: true
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 250);
                    res.render('WXlikeQuick', {
                        title: '图文阅读/点赞快速任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/like/quick'
                    })
                });
        });
});

router.get('/account/search/like/quick', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'readQuick',
                    quick: true,
                    address: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 100);
                    res.render('WXlikeQuick', {
                        title: '图文阅读/点赞快速任务',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/like/quick'
                    })
                });
        });
});

router.get('/like/quick/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'readQuick'})
                .then(function(read) {
                    var readIns = Product.wrapToInstance(read);
                    var myReadPrice = readIns.getPriceByRole(user.role);
                    Product.open().findOne({type: 'wx', smallType: 'likeQuick'})
                        .then(function(like) {
                            var likeIns = Product.wrapToInstance(like);
                            var myLikePrice = likeIns.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('WXlikeQuickAdd', {
                                    title: '添加微信图文阅读点赞快速任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    price: myReadPrice,
                                    price2: myLikePrice,
                                    orderFlag: orderFlag
                                });
                            })
                        });
                });
        });
});

router.post('/like/quick/add', function (req, res) {
    var orderInfo = req.body;
    if(!orderInfo.address){
        return res.send('<h1>任务地址不能为空不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(!orderInfo.num || !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) || orderInfo < 500) {
        return res.send('<h1>需要添加的粉丝数量不能为空,且必须是正整数， 最低500起.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(orderInfo.num2 && !/^[0-9]*[1-9][0-9]*$/.test(orderInfo.num) && orderInfo.num2 > (orderInfo.num*3/100)) {
        return res.send('<h1>点赞数量必须为正整数,且不能大于阅读数量的3%!.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }

    orderInfo.quick = true;
    orderInfo.num = parseInt(orderInfo.num);
    if(orderInfo.num2 == ''){
        orderInfo.num2 = parseInt(orderInfo.num * 5 / 1000);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {

            var order = Order.wrapToInstance(orderInfo);
            if(orderInfo.orderFlag) {
                order.checkRandomStr(req).then(function() {
                    order.createAndSaveTwo(user, {type: 'wx', smallType: 'readQuick'}, {type: 'wx', smallType: 'likeQuick'})
                        .then(function () {
                            socketIO.emit('updateNav', {'wxLikeQuick': 1});
                            res.redirect('/wx/like/quick');
                        }, function() {
                            res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                        });
                }, function(msg) {
                    res.redirect('/wx/like/quick');
                })
            }else {
                order.createAndSaveTwo(user, {type: 'wx', smallType: 'readQuick'}, {type: 'wx', smallType: 'likeQuick'})
                    .then(function (result) {
                        socketIO.emit('updateNav', {'wxLikeQuick': 1});
                        res.send({funds: result.funds, msg: '提交成功！'});
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }
        });
});

router.get('/like/quick/bulk/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'readQuick'})
                .then(function(read) {
                    var readIns = Product.wrapToInstance(read);
                    var myReadPrice = readIns.getPriceByRole(user.role);
                    Product.open().findOne({type: 'wx', smallType: 'likeQuick'})
                        .then(function(like) {
                            var likeIns = Product.wrapToInstance(like);
                            var myLikePrice = likeIns.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('WXlikeQuickBulkAdd', {
                                    title: '批量添加微信图文阅读点赞快速任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    price: myReadPrice,
                                    price2: myLikePrice,
                                    orderFlag: orderFlag
                                });
                            })
                        });
                });
        });
});





router.get('/comment', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'comment'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 0.5);
                    res.render('WXcomment', {
                        title: '微信/图文评论',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/comment'
                    })
                });
        });
});

router.get('/comment/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'comment'})
                .then(function(comment) {
                    var commentIns = Product.wrapToInstance(comment);
                    var myCommentPrice = commentIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('WXcommentAdd', {
                            title: '添加微信图文评论任务',
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
    var orderInfo = req.body;
    if(!orderInfo.address){
        return res.send('<h1>任务地址不能为空不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    if(orderInfo.content == '') {
        return res.send('<h1>评论内容不能为空.请不要跳过前端验证,如果是浏览器兼容性不好导致前端验证失效，推荐使用谷歌浏览器！！！</h1>');
    }
    var num = orderInfo.content.split('\n').length;
    orderInfo.num = (num > 5) ? num : 5;
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'wx', smallType: 'comment'})
                    .then(function () {
                        socketIO.emit('updateNav', {'wxComment': 1});
                        res.redirect('/wx/comment');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/wx/comment');
            })
        });
});

router.get('/account/search/comment', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'comment',
                    address: req.query.account
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results);
                    res.render('WXcomment', {
                        title: '微信/图文评论',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/comment'
                    })
                });
        });
});



router.get('/code', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'code'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('WXcode', {
                        title: '扫码关注',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/code'
                    })
                });
        });
});

router.get('/date/search/code', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'wx',
                    smallType: 'code',
                    createTime: new RegExp(req.query.createTime)
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 50);
                    res.render('WXcode', {
                        title: '扫码关注',
                        money: user.funds,
                        username: user.username,
                        userStatus: user.status,
                        role: user.role,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/WX/code'
                    })
                });
        });
});

router.get('/code/add', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'wx', smallType: 'code'})
                .then(function(fans) {
                    var fansIns = Product.wrapToInstance(fans);
                    var myFansPrice = fansIns.getPriceByRole(user.role);
                    Product.open().findOne({type: 'wx', smallType: 'codeReply'})
                        .then(function(reply) {
                            var replyIns = Product.wrapToInstance(reply);
                            var myReplyPrice = replyIns.getPriceByRole(user.role);
                            Order.getRandomStr(req).then(function(orderFlag) {
                                res.render('WXcodeAdd', {
                                    title: '添加扫码关注任务',
                                    money: user.funds,
                                    username: user.username,
                                    userStatus: user.status,
                                    role: user.role,
                                    fansPrice: myFansPrice,
                                    replyPrice: myReplyPrice,
                                    orderFlag: orderFlag
                                });
                            })
                        });
                });
        });
});

router.post('/code/add', function (req, res) {
    var order = {};
    var form = new Formidable.IncomingForm();
    form.maxFieldsSize = 1024 * 1024;
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    form.hash = 'md5';
    var logoDir = form.uploadDir = global.codeDir;

    if(!fs.existsSync(logoDir)){
        fs.mkdirSync(logoDir);
    }
    form.on('error', function(err) {
            res.end(err); //各种错误
        }).on('field', function(field, value) {
            order[field] = value;
        }).on('file', function(field, file) { //上传文件
            var filePath = file.path;
            var fileExt = filePath.substring(filePath.lastIndexOf('.'));
            var newFileName = file.hash + fileExt;
            var newFilePath = path.join(logoDir + newFileName);
            fs.rename(filePath, newFilePath, function (err) {
                order[field] = '/codes/' + newFileName;
                order.num2 = order.reply == '' ? 0 : order.num;
                User.open().findById(req.session.passport.user)
                    .then(function (user) {
                        var orderIns = Order.wrapToInstance(order);
                        orderIns.checkRandomStr(req).then(function() {
                            orderIns.createAndSaveTwo(user, {type: 'wx', smallType: 'code'}, {type: 'wx', smallType: 'codeReply'})
                                .then(function () {
                                    socketIO.emit('updateNav', {'wxCode': 1});
                                    res.redirect('/wx/code');
                                }, function() {
                                    res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                                });
                        }, function(msg) {
                            res.redirect('/wx/code');
                        })
                    });
            });
        });
    form.parse(req);
});

module.exports = router;