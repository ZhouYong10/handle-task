/**
 * Created by zhouyong10 on 1/24/16.
 */
var User = require('../models/User');
var Product = require('../models/Product');
var Order = require('../models/Order');

var router = require('express').Router();

router.get('/forumTask', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findOne({type: 'flow', smallType: 'forum'})
                .then(function(result) {
                    var instance = Product.wrapToInstance(result);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('flowForumTask', {
                            title: '论坛流量任务',
                            money: user.funds,
                            userStatus: user.status,
                            username: user.username,
                            role: user.role,
                            price: instance.getPriceByRole(user.role),
                            orderFlag: orderFlag
                        })
                    })
                })
        });
});

router.post('/forumTask', function (req, res) {
    var orderInfo = req.body;
    orderInfo.realNum = orderInfo.num;
    if(orderInfo.num <= 10000) {
        orderInfo.num = 2;
    }else {
        orderInfo.num = parseInt(orderInfo.num / 5000) + (orderInfo.num % 5000 > 0 ? 1 : 0);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'flow', smallType: 'forum'})
                    .then(function () {
                        socketIO.emit('updateNav', {'flow': 1});
                        res.redirect('/flow/taskHistory');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/flow/taskHistory');
            })
        });
});


/*
* 原版：通过识别地址来区分任务产品，获取任务产品信息和价格
* */
router.get('/videoTask', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.getRandomStr(req).then(function(orderFlag) {
                res.render('flowVideoTask', {
                    title: '视频流量任务',
                    money: user.funds,
                    userStatus: user.status,
                    username: user.username,
                    role: user.role,
                    orderFlag: orderFlag
                });
            })
        });
});

router.post('/videoTask', function (req, res) {
    var orderInfo = req.body;
    orderInfo.realNum = orderInfo.num;
    if(orderInfo.num <= 10000) {
        orderInfo.num = 10;
    }else {
        orderInfo.num = parseInt(orderInfo.num / 1000) + (orderInfo.num % 1000 > 0 ? 1 : 0);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'flow', smallType: 'video', name: orderInfo.name})
                    .then(function () {
                        socketIO.emit('updateNav', {'flow': 1});
                        res.redirect('/flow/taskHistory');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/flow/taskHistory');
            })
        });
});

router.get('/video/get/price', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var address = req.query.address;
            var arr = address.split('/')[2].split('.');
            //arr.shift();
            var mainUrl = arr.join('.');
            Product.open().findOne({
                type: 'flow',
                address: new RegExp(mainUrl)
            }).then(function (result) {
                if(result) {
                    var instance = Product.wrapToInstance(result);
                    res.send({
                        isOk: true,
                        price: instance.getPriceByRole(user.role),
                        name: result.name
                    });
                }else {
                    res.send({
                        isOk: false,
                        message: '对不起，暂时不支持该链接地址！'
                    })
                }
            });
        });
});



/*
* 新版：将所有视频流量任务展开成列表，由用户自行选择添加任务
* */
router.get('/videoList', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().find({
                type: 'flow',
                smallType: 'video'
            }).then(function (obj) {
                res.render('flowVideoList', {
                    title: '视频流量任务列表',
                    money: user.funds,
                    username: user.username,
                    userStatus: user.status,
                    role: user.role,
                    products: obj
                })
            });
        });
});

router.get('/product/search/name', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().find({
                type: 'flow',
                smallType: 'video',
                name: new RegExp(req.query.productName)
            }).then(function (obj) {
                res.render('flowVideoList', {
                    title: '视频流量任务列表',
                    money: user.funds,
                    username: user.username,
                    userStatus: user.status,
                    role: user.role,
                    products: obj
                })
            }, function (error) {
                res.send('查询视频流量任务列表失败： ' + error);
            });
        });

});

router.get('/add/video/task', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Product.open().findById(req.query.id)
                .then(function(product) {
                    var productIns = Product.wrapToInstance(product);
                    var price = productIns.getPriceByRole(user.role);
                    Order.getRandomStr(req).then(function(orderFlag) {
                        res.render('flowVideoTaskAdd', {
                            title: '添加视频流量任务',
                            money: user.funds,
                            userStatus: user.status,
                            username: user.username,
                            role: user.role,
                            orderFlag: orderFlag,
                            price: price,
                            productName: product.name
                        });
                    })
                })

        });
});

router.post('/videoTask/add', function (req, res) {
    var orderInfo = req.body;
    orderInfo.realNum = orderInfo.num;
    if(orderInfo.num <= 10000) {
        orderInfo.num = 10;
    }else {
        orderInfo.num = parseInt(orderInfo.num / 1000) + (orderInfo.num % 1000 > 0 ? 1 : 0);
    }
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var order = Order.wrapToInstance(orderInfo);
            order.checkRandomStr(req).then(function() {
                order.createAndSave(user, {type: 'flow', smallType: 'video', name: orderInfo.name})
                    .then(function () {
                        socketIO.emit('updateNav', {'flow': 1});
                        res.redirect('/flow/taskHistory');
                    }, function() {
                        res.send('<h1>您的余额不足，请充值！ 顺便多说一句，请不要跳过页面非法提交数据。。。不要以为我不知道哦！！</h1>')
                    });
            }, function(msg) {
                res.redirect('/flow/taskHistory');
            })
        });
});




router.get('/taskHistory', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            Order.open().findPages({
                    userId: user._id,
                    type: 'flow'
                }, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 100);
                    res.render('flowTaskHistory', {
                        title: '流量业务任务历史',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/flow/taskHistory'
                    });
                });
        });
});

router.get('/search/flow', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var query = {userId: user._id, type: 'flow'};
            if(req.query.address){
                query.address = req.query.address;
            }
            if (req.query.createTime) {
                query.createTime = new RegExp(req.query.createTime);
            }
            Order.open().findPages(query, (req.query.page ? req.query.page : 1))
                .then(function (obj) {
                    Order.addSchedule(obj.results, 100);
                    res.render('flowTaskHistory', {
                        title: '流量业务任务历史',
                        money: user.funds,
                        role: user.role,
                        userStatus: user.status,
                        username: user.username,
                        orders: obj.results,
                        pages: obj.pages,
                        path: '/flow/taskHistory'
                    });
                }, function (error) {
                    res.send('查询记录失败： ' + error);
                });
        });
});

module.exports = router;