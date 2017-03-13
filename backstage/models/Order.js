/**
 * Created by zhouyong10 on 2/3/16.
 */
var db = require('../dbWrap');
var User = require('./User');
var Product = require('./Product');
var Profit = require('./Profit');
var Address = require('./Address');
var request = require('request');
var cheerio = require('cheerio');

var Class = require('./Class');

//var bcrypt = require('bcryptjs');
var moment = require('moment');

var Formidable = require('formidable');
var images = require('images');
var fs = require('fs');
var path = require('path');


var Order = new Class();


Order.extend(db);

Order.open = function() {
    return Order.openCollection('Order');
};


global.readSpeed = 1;
Order.extend({
    getRandomStr: function(req) {
        return new Promise(function(resolve, reject) {
            var str = Math.random().toString(36).substr(2);
            req.session.orderFlag = str;
            resolve(str);
        })
    },
    getOrderFreezeFunds: function() {
        return new Promise(function(resolve, reject) {
            Order.open().find({
                status: {$in: ['审核中', '已发布', '已暂停']}
            }).then(function(orders) {
                var count = 0;
                orders.forEach(function (order) {
                    count += parseFloat(order.surplus);
                });
                resolve(count.toFixed(4));
            })
        })
    },
    mkdirsSync: function(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (Order.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    },
    getOrder: function getOrder(req) {
        var picField;
        return new Promise(function(resolve, reject) {
            var order = {};
            var form = new Formidable.IncomingForm();
            form.maxFieldsSize = 1024 * 1024;
            form.encoding = 'utf-8';
            form.keepExtensions = true;
            form.hash = 'md5';
            var logoDir = form.uploadDir = global.handleExam + moment().format('YYYY-MM-DD') + '/';

            Order.mkdirsSync(logoDir);
            form.on('error', function(err) {
                reject(err);
            }).on('field', function(field, value) {
                order[field] = value;
            }).on('file', function(field, file) { //上传文件
                picField = field;
                var filePath = file.path;
                var fileExt = filePath.substring(filePath.lastIndexOf('.'));
                var newFileName = new Date().getTime() + '-' + file.hash + fileExt;
                var newFilePath = path.join(logoDir + newFileName);
                try{
                    fs.renameSync(filePath, newFilePath);
                    order[picField] = '/handle_example/' + moment().format('YYYY-MM-DD') + '/' + newFileName;
                }catch (e){
                    console.log('图片上传失败： ' + e);
                    reject('图片上传失败!');
                }
            }).on('end', function() {
                resolve(order);
            });
            form.parse(req);
        })
    },
    addSchedule: function(orders, speedNum) {
        for(var i in orders) {
            var order = orders[i];
            if(order.status == '已处理'){
                var dealTime = order.dealTime, num = (order.type == 'flow' ? order.realNum : order.num),
                    delay = 3 * 60 * 1000, speed = order.speed ? order.speed : speedNum;
                if(order.smallType == 'read'){
                    speed = global.readSpeed;
                }

                var allTimes = (parseInt(num / speed) + ((num % speed == 0) ? 0 : 1)) * 60 * 1000;
                var currentTimes = new Date().getTime() - new Date(dealTime).getTime() - delay;

                if(currentTimes > 0) {
                    var percent = (currentTimes / allTimes).toFixed(4);
                    if(percent < 1) {
                        percent = (percent * 100).toFixed(2) + '%';
                        order.status = '执行中';
                    }else {
                        percent = '100%';
                        order.status = '已完成';
                    }
                    order.schedule = percent;
                }else {
                    order.status = '未处理';
                }
            }
        }
        return orders;
    },
    openWXReadQuickAuto: function(cookie) {
        cookieInfoQuick = cookie;
        wxReadIsOpenQuick = 'yes';
        valIndexQuick = startIntervalQuick();
        //getOrderStartNum();
    },
    closeWXReadQuickAuto: function() {
        wxReadIsOpenQuick = 'no';
        //clearInterval(valIndex);
    },
    wxReadQuickIsOpen: function() {
        return wxReadIsOpenQuick;
    },
    openWXReadAuto: function(cookie) {
        wxReadIsOpen = 'yes';
        startInterval();
    },
    closeWXReadAuto: function() {
        wxReadIsOpen = 'no';
    },
    wxReadIsOpen: function() {
        return wxReadIsOpen;
    },
    openWXFansAuto: function(cookie) {
        wxFansCookieInfo = cookie;
        wxFansIsOpen = 'yes';
        wxSetIntIndex = startFans();
    },
    closeWXFansAuto: function() {
        wxFansIsOpen = 'no';
        stopFans();
    },
    wxFansIsOpen: function() {
        return wxFansIsOpen;
    }
});

Order.include({
    checkRandomStr: function(req) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if(self.orderFlag == req.session.orderFlag) {
                req.session.orderFlag = '';
                resolve();
            }else {
                console.log('订单已经提交了，请勿重复提交！');
                reject();
            }
        })
    },
    save: function(callback) {
        var self = this;
        Order.open().insert(self)
            .then(function () {
                User.open().updateById(self.userId, {$set: {funds: self.funds}})
                    .then(function () {
                        callback(self);
                    });
            });
    },
    handleCreateAndSave: function(user, info) {
        var self = this;
        return new Promise(function(resolve, reject) {
            Product.open().findOne(info)
                .then(function(result) {
                    var product = Product.wrapToInstance(result);
                    var myPrice = product.getPriceByRole(user.role);
                    if(!self.price || parseFloat(self.price) < parseFloat(myPrice)) {
                        self.price = myPrice;
                    }
                    self.totalPrice = (self.price * self.num).toFixed(4);
                    if((self.totalPrice - user.funds) > 0) {
                        return reject();
                    }
                    self.realPrice = self.price;
                    self.surplus = self.totalPrice;
                    self.releasePrice = (parseFloat(self.price) + parseFloat(self.price2 ? self.price2 : 0)).toFixed(2);
                    self.user = user.username;
                    self.userId = user._id;
                    self.name = product.name;
                    self.type = product.type;
                    self.typeName = product.typeName;
                    self.smallType = product.smallType;
                    self.smallTypeName = product.smallTypeName;
                    self.status = '审核中';
                    self.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    self.funds = (user.funds - self.totalPrice).toFixed(4);
                    self.description = self.typeName + self.smallTypeName + '执行' + self.num;
                    self.taskNum = 0;
                    self.taskUsers = [];
                    self.handleCountParentProfit(user, product, function(obj) {
                        resolve(obj);
                    });
                });
        });
    },
    handleCreateAndSaveTwo: function(user, info1, info2) {
        var self = this;
        return new Promise(function(resolve, reject) {
            Product.open().findOne(info1)
                .then(function(result1) {
                    var product1 = Product.wrapToInstance(result1);
                    Product.open().findOne(info2)
                        .then(function (result2) {
                            var product2 = Product.wrapToInstance(result2);
                            var myPrice1 = product1.getPriceByRole(user.role);
                            var myPrice2 = product2.getPriceByRole(user.role);
                            if(!self.price || parseFloat(self.price) < parseFloat(myPrice1)) {
                                self.price = myPrice1;
                            }
                            if(!self.price2 || parseFloat(self.price2) < parseFloat(myPrice2)) {
                                self.price2 = myPrice2;
                            }
                            self.totalPrice = (self.price * self.num + self.price2 * self.num2).toFixed(4);
                            if ((self.totalPrice - user.funds) > 0) {
                                return reject();
                            }
                            self.realPrice = self.price;
                            self.realPrice2 = self.price2;
                            self.surplus = self.totalPrice;
                            self.releasePrice = (parseFloat(self.price) + parseFloat(self.price2 ? self.price2 : 0)).toFixed(2);
                            self.user = user.username;
                            self.userId = user._id;
                            self.name = product1.name;
                            self.type = product1.type;
                            self.typeName = product1.typeName;
                            self.smallType = product1.smallType;
                            self.smallTypeName = product1.smallTypeName;
                            self.status = '审核中';
                            self.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
                            self.funds = (user.funds - self.totalPrice).toFixed(4);
                            self.description = self.typeName + self.smallTypeName + '执行' + self.num + '; ' +
                                product2.typeName + product2.smallTypeName + '执行' + self.num2;
                            self.taskNum = 0;
                            self.taskUsers = [];

                            self.handleCountParentProfitTwo(user, product1, product2, function(obj) {
                                resolve(obj);
                            });
                        });
                });
        });
    },
    handleCountParentProfit: function(user, product, callback) {
        var self = this;
        var name = '';
        if(user.parentID) {
            User.open().findById(user.parentID)
                .then(function(parent) {
                    switch (parent.role) {
                        case '管理员':
                            name = 'adminProfit';
                            break;
                        case '顶级代理':
                            name = 'topProfit';
                            break;
                        case '超级代理':
                            name = 'superProfit';
                            break;
                        case '金牌代理':
                            name = 'goldProfit';
                            break;
                    }
                    var selfPrice = product.getPriceByRole(user.role);
                    var parentPrice = product.getPriceByRole(parent.role);
                    var profit = selfPrice - parentPrice;
                    self[name] = profit.toFixed(4);
                    self.realPrice = (self.realPrice - profit).toFixed(4);
                    self.handleCountParentProfit(parent, product, callback);
                })
        }else {
            var adminPer = product.getPerByRole('管理员'), topPer = product.getPerByRole('顶级代理'),
                superPer = product.getPerByRole('超级代理'), goldPer = product.getPerByRole('金牌代理');
            self.adminPerPrice = (self.realPrice * adminPer).toFixed(2);
            self.topPerPrice = (self.realPrice * topPer).toFixed(2);
            self.superPerPrice = (self.realPrice * superPer).toFixed(2);
            self.goldPerPrice = (self.realPrice * goldPer).toFixed(2);
            self.save(callback);
        }
    },
    handleCountParentProfitTwo: function(user, product1, product2, callback) {
        var self = this;
        var profit = '';
        if(user.parentID) {
            User.open().findById(user.parentID)
                .then(function(parent) {
                    switch (parent.role) {
                        case '管理员':
                            profit = 'adminProfit';
                            break;
                        case '顶级代理':
                            profit = 'topProfit';
                            break;
                        case '超级代理':
                            profit = 'superProfit';
                            break;
                        case '金牌代理':
                            profit = 'goldProfit';
                            break;
                    }
                    var selfPrice1 = product1.getPriceByRole(user.role);
                    var selfPrice2 = product2.getPriceByRole(user.role);
                    var parentPrice1 = product1.getPriceByRole(parent.role);
                    var parentPrice2 = product2.getPriceByRole(parent.role);

                    var profit1 = selfPrice1 - parentPrice1;
                    var profit2 = selfPrice2 - parentPrice2;
                    self[profit] = (profit1 + profit2).toFixed(4);

                    self.realPrice = (self.realPrice - profit1).toFixed(4);
                    self.realPrice2 = (self.realPrice2 - profit2).toFixed(4);
                    self.handleCountParentProfitTwo(parent, product1, product2, callback);
                })
        }else {
            var adminPer1 = product1.getPerByRole('管理员'), adminPer2 = product2.getPerByRole('管理员'),
                topPer1 = product1.getPerByRole('顶级代理'), topPer2 = product2.getPerByRole('顶级代理'),
                superPer1 = product1.getPerByRole('超级代理'), superPer2 = product2.getPerByRole('超级代理'),
                goldPer1 = product1.getPerByRole('金牌代理'), goldPer2 = product2.getPerByRole('金牌代理');
            self.adminPerPrice = (self.realPrice * adminPer1 + self.realPrice2 * adminPer2).toFixed(2);
            self.topPerPrice = (self.realPrice * topPer1 + self.realPrice2 * topPer2).toFixed(2);
            self.superPerPrice = (self.realPrice * superPer1 + self.realPrice2 * superPer2).toFixed(2);
            self.goldPerPrice = (self.realPrice * goldPer1 + self.realPrice2 * goldPer2).toFixed(2);
            self.save(callback);
        }
    },
    handleRelease: function() {
        var self = this;

        var sourcePath = path.join(global.handleExam, '../' + self.photo);
        var waterPath = path.join(global.handleExam, '../static/images/waterImg.jpg');
        var sourceImg = images(sourcePath);
        var waterImg = images(waterPath);
        waterImg.resize(sourceImg.width() / 5 * 2);
        images(sourceImg)
            .draw(waterImg, sourceImg.width() - waterImg.width() -20, sourceImg.height() -waterImg.height() - 20)
            .save(sourcePath);
        return new Promise(function(resolve, reject) {
            Order.open().updateById(self._id, {
                $set: {
                    status: '已发布',
                    releaseTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    taskNum: 0,
                    taskUsers: []
                }
            }).then(function() {
                resolve();
            })
        })
    },
    createAndSave: function(user, info) {
        var self = this;
        return new Promise(function(resolve, reject) {
            Product.open().findOne(info)
                .then(function(result) {
                    var product = Product.wrapToInstance(result);
                    var myPrice = product.getPriceByRole(user.role);
                    self.totalPrice = (myPrice * self.num).toFixed(4);
                    if(product.type == 'forum'){
                        if(self.totalPrice < 0.5) {
                            self.totalPrice = 0.5;
                        }
                    }
                    if((self.totalPrice - user.funds) > 0) {
                        return reject();
                    }
                    self.price = myPrice;
                    self.user = user.username;
                    self.userId = user._id;
                    self.name = product.name;
                    self.type = product.type;
                    self.typeName = product.typeName;
                    self.smallType = product.smallType;
                    self.smallTypeName = product.smallTypeName;
                    self.status = '未处理';
                    self.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    self.funds = (user.funds - self.totalPrice).toFixed(4);
                    self.description = self.typeName + self.smallTypeName + '执行' + self.num;
                    self.countParentProfit(user, product, function(obj) {
                        resolve(obj);
                    });
                });
        });
    },
    createAndSaveTwo: function(user, info1, info2){
        var self = this;
        return new Promise(function(resolve, reject) {
            Product.open().findOne(info1)
                .then(function(result1) {
                    var product1 = Product.wrapToInstance(result1);
                    Product.open().findOne(info2)
                        .then(function (result2) {
                            var product2 = Product.wrapToInstance(result2);
                            var myPrice1 = product1.getPriceByRole(user.role);
                            var myPrice2 = product2.getPriceByRole(user.role);
                            if(!self.price || parseFloat(self.price) < parseFloat(myPrice1)) {
                                self.price = myPrice1;
                            }
                            if(!self.price2 || parseFloat(self.price2) < parseFloat(myPrice2)) {
                                self.price2 = myPrice2;
                            }
                            self.totalPrice = (self.price * self.num + self.price2 * self.num2).toFixed(4);
                            if(product1.type == 'handle' && product1.smallType == 'WXfans' && !self.isReply){
                                self.totalPrice = (self.price * self.num).toFixed(4);
                            }
                            if ((self.totalPrice - user.funds) > 0) {
                                return reject();
                            }
                            self.surplus = self.totalPrice;
                            self.user = user.username;
                            self.userId = user._id;
                            self.name = product1.name;
                            self.type = product1.type;
                            self.typeName = product1.typeName;
                            self.smallType = product1.smallType;
                            self.smallTypeName = product1.smallTypeName;
                            self.status = '未处理';
                            self.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
                            self.funds = (user.funds - self.totalPrice).toFixed(4);
                            self.description = self.typeName + self.smallTypeName + '执行' + self.num + '; ' +
                                               product2.typeName + product2.smallTypeName + '执行' + self.num2;
                            self.countParentProfitTow(user, product1, product2, function(obj) {
                                resolve(obj);
                            });
                        });
                });
        });
    },
    countParentProfit: function (user, product, callback) {
        var self = this;
        var name = '';
        if(user.parentID) {
            User.open().findById(user.parentID)
                .then(function(parent) {
                    switch (parent.role) {
                        case '管理员':
                            name = 'adminProfit';
                            break;
                        case '顶级代理':
                            name = 'topProfit';
                            break;
                        case '超级代理':
                            name = 'superProfit';
                            break;
                        case '金牌代理':
                            name = 'goldProfit';
                            break;
                    }
                    var selfPrice = product.getPriceByRole(user.role);
                    var parentPrice = product.getPriceByRole(parent.role);
                    var profit = selfPrice - parentPrice;
                    self[name] = (profit * self.num).toFixed(4);
                    self.countParentProfit(parent, product, callback);
                })
        }else {
            self.save(callback);
        }
    },
    countParentProfitTow: function (user, product1, product2, callback) {
        var self = this;
        var name = '';
        if(user.parentID) {
            User.open().findById(user.parentID)
                .then(function(parent) {
                    switch (parent.role) {
                        case '管理员':
                            name = 'adminProfit';
                            break;
                        case '顶级代理':
                            name = 'topProfit';
                            break;
                        case '超级代理':
                            name = 'superProfit';
                            break;
                        case '金牌代理':
                            name = 'goldProfit';
                            break;
                    }
                    var selfPrice1 = product1.getPriceByRole(user.role);
                    var selfPrice2 = product2.getPriceByRole(user.role);
                    var parentPrice1 = product1.getPriceByRole(parent.role);
                    var parentPrice2 = product2.getPriceByRole(parent.role);

                    var profit1 = selfPrice1 - parentPrice1;
                    var profit2 = selfPrice2 - parentPrice2;
                    self[name] = (profit1 * self.num + profit2 * self.num2).toFixed(4);
                    if(product1.type == 'handle' && product1.smallType == 'WXfans' && !self.isReply){
                        self[name] = (profit1 * self.num).toFixed(4);
                    }
                    self.surplus -= self[name];
                    self.countParentProfitTow(parent, product1, product2, callback);
                })
        }else {
            self.save(callback);
        }
    },
    complete: function(callback) {
        var self = this;
        User.open().findById(self.userId)
            .then(function(user) {
                self.profitToParent(user, user, function(order) {
                    if(self.remote){
                        Order.open().updateById(self._id, {
                            $set: {
                                startReadNum: self.startReadNum,
                                remote: self.remote,
                                status: '已处理',
                                dealTime:  moment().format('YYYY-MM-DD HH:mm:ss')
                            }
                        }).then(function () {
                            callback();
                        });
                    }else {
                        Order.open().updateById(self._id, {
                            $set: {
                                startReadNum: self.startReadNum,
                                status: '已处理',
                                dealTime:  moment().format('YYYY-MM-DD HH:mm:ss')
                            }
                        }).then(function () {
                            callback();
                        });
                    }
                });
            })
    },
    profitToParent: function(orderUser, child, callback) {
        var self = this;
        var name = '';
        if(child.parentID) {
            User.open().findById(child.parentID)
                .then(function(parent) {
                    switch (parent.role) {
                        case '管理员':
                            name = 'adminProfit';
                            break;
                        case '顶级代理':
                            name = 'topProfit';
                            break;
                        case '超级代理':
                            name = 'superProfit';
                            break;
                        case '金牌代理':
                            name = 'goldProfit';
                            break;
                    }
                    parent.funds = (parseFloat(self[name]) + parseFloat(parent.funds)).toFixed(4);
                    User.open().updateById(parent._id, {$set: {funds: parent.funds}})
                        .then(function () {
                            Profit.open().insert({
                                userId: parent._id,
                                username: parent.username,
                                orderUserId: orderUser._id,
                                orderUsername: orderUser.username,
                                typeName: self.typeName,
                                smallTypeName: self.smallTypeName,
                                profit: self[name],
                                orderId: self._id,
                                status: 'success',
                                createTime: self.createTime
                            }).then(function (profit) {
                                self.profitToParent(orderUser, parent, callback);
                            })
                        });
                })
        }else {
            callback(self);
        }
    },
    refund: function(info, callback) {
        var self = this;
        self.status = '已退款';
        self.error = '已处理';
        self.refundInfo = info;
        Order.open().updateById(self._id, self)
            .then(function () {
                User.open().findById(self.userId)
                    .then(function (user) {
                        user.funds = (parseFloat(self.totalPrice) + parseFloat(user.funds)).toFixed(4);
                        User.open().updateById(user._id, {$set: {funds: user.funds}})
                            .then(function () {
                                callback();
                            });
                    });
            });
    },
    refundProfit: function(info, callback) {
        var self = this;
        self.refund(info, function() {
            Profit.open().find({orderId: self._id})
                .then(function(profits) {
                    profits.forEach(function(profit) {
                        User.open().findById(profit.userId)
                            .then(function(user) {
                                user.funds = (parseFloat(user.funds) - parseFloat(profit.profit)).toFixed(4);
                                User.open().updateById(user._id, {$set: {funds: user.funds}})
                                    .then(function() {
                                        Profit.open().updateById(profit._id, {$set: {status: 'refund'}});
                                    })
                            })
                    });
                    callback();
                })
        })
    },
    orderError: function(info, callback) {
        Order.open().updateById(this._id, {
            $set: {
                error: '未处理',
                errorInfo: info,
                errorTime: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }).then(function() {
            callback();
        })
    },
    dealError: function(info, callback) {
        Order.open().updateById(this._id, {$set: {error: '已处理', errorDealInfo: info}})
            .then(function() {
                callback();
            })
    }
});

module.exports = Order;
