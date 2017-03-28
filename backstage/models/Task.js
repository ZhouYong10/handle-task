/**
 * Created by ubuntu64 on 5/31/16.
 */
var db = require('../dbWrap');
var Class = require('./Class');
var Order = require('./Order');
var User = require('./User');
var Profit = require('./Profit');
var moment = require('moment');


var Task = new Class();

Task.extend(db);
Task.extend({
    getRandomStr: function(req) {
        return new Promise(function(resolve, reject) {
            var str = Math.random().toString(36).substr(2);
            req.session.orderFlag = str;
            resolve(str);
        })
    },
    checkRandomStr: function(req, info) {
        return new Promise(function(resolve, reject) {
            if(info.orderFlag == req.session.orderFlag) {
                req.session.orderFlag = '';
                resolve();
            }else {
                console.log('订单已经提交了，请勿重复提交！');
                reject();
            }
        })
    },
    getTaskFreezeFunds: function() {
        return new Promise(function(resolve, reject) {
            Task.open().find({
                taskStatus: {$in: ['待审核', '被投诉']}
            }).then(function(tasks) {
                var count = 0;
                tasks.forEach(function (task) {
                    count += parseFloat(task.releasePrice);
                });
                resolve(count.toFixed(4));
            })
        })
    },
    createTask: function(info) {
        return new Promise(function(resolve, reject) {
            User.open().findById(info.userId)
                .then(function (user) {
                    Order.open().findOne({
                        _id: db.toObjectID(info.orderId),
                        status: '已发布'
                    }).then(function(order) {
                        if(order) {
                            var flag = true;
                            for(var i = 0; i < order.taskUsers.length; i++) {
                                var taskUser = order.taskUsers[i];
                                if ((taskUser + '') == (user._id + '')) {
                                    flag = false;
                                    reject('您已经做过该任务了，不要以为我不知道哦！！！');
                                }
                            }
                            if(flag) {
                                order.orderId = order._id + '';
                                delete order._id;
                                order.taskAccount = user.taskAccount;
                                order.taskName = user.taskName;
                                order.taskUserId = user._id;
                                order.taskUser = user.username;
                                order.taskPhoto = info.taskPhoto;
                                order.taskCreateTime = moment().format('YYYY-MM-DD HH:mm:ss');
                                order.taskStatus = '待审核';
                                order.taskUserParentId = user.parentID;
                                profitFreezeFunds(order);
                                Task.open().insert(order).then(function(tasks) {
                                    var updateInfo = {
                                        $set: {surplus: (order.surplus - order.price - (order.price2 ? order.price2 : 0)).toFixed(4)},
                                        $inc: {taskNum: 1},
                                        $push: {taskUsers: user._id}
                                    };
                                    if((order.num - (order.taskNum ? order.taskNum : 0)) == 1) {
                                        updateInfo[$set].status = '已完成';
                                    }
                                    Order.open().updateById(info.orderId, updateInfo)
                                        .then(function(result) {
                                            resolve(tasks[0]);
                                        })
                                })
                            }
                        }else {
                            reject('不好意思，任务已经结束了，下次动作要快点哦！');
                        }
                    })
                });
        })
    }
});

function profitFreezeFunds(task) {
    User.open().findOne({username: 'admin'})
        .then(function (admin) {
            var price;
            //做任务者的父级
            if(task.taskUserParentId) {
                price = task.handerChildPrice;
                User.open().findById(task.taskUserParentId)
                    .then(function (taskUserParent) {
                        if(taskUserParent) {
                            User.open().updateById(taskUserParent._id, {
                                $set: {
                                    freezeFunds: (parseFloat(taskUserParent.freezeFunds) +
                                    parseFloat(task.handerParentProfit)).toFixed(4)
                                }
                            });
                        }else{
                            User.open().updateById(admin._id, {
                                $set: {
                                    freezeFunds: (parseFloat(admin.freezeFunds) +
                                    parseFloat(task.handerParentProfit)).toFixed(4)
                                }
                            });
                        }
                    });
            }else{
                price = task.handerParentPrice;
            }
            //做任务者自己
            User.open().findById(task.taskUserId)
                .then(function (taskUser) {
                    if(taskUser) {
                        User.open().updateById(taskUser._id, {
                            $set: {
                                freezeFunds: (parseFloat(taskUser.freezeFunds) + parseFloat(price)).toFixed(4)
                            }
                        });
                    }else{
                        User.open().updateById(admin._id, {
                            $set: {
                                freezeFunds: (parseFloat(admin.freezeFunds) + parseFloat(price)).toFixed(4)
                            }
                        });
                    }
                });
            //发布任务者的父级
            if(task.userParentId) {
                User.open().findById(task.userParentId)
                    .then(function (orderUserParent) {
                        if(orderUserParent) {
                            User.open().updateById(orderUserParent._id, {
                                $set: {
                                    freezeFunds: (parseFloat(orderUserParent.freezeFunds) +
                                    parseFloat(task.taskerParentProfit)).toFixed(4)
                                }
                            });
                        }else{
                            User.open().updateById(admin._id, {
                                $set: {
                                    freezeFunds: (parseFloat(admin.freezeFunds) +
                                    parseFloat(task.taskerParentProfit)).toFixed(4)
                                }
                            });
                        }
                    });
            }
            //发布任务者自己
            User.open().findById(task.userId)
                .then(function (orderUser) {
                    if(orderUser) {
                        User.open().updateById(orderUser._id, {
                            $set: {
                                freezeFunds: (parseFloat(orderUser.freezeFunds) -
                                (parseFloat(task.price) + parseFloat(task.price2 ? task.price2 : 0))).toFixed(4)
                            }
                        });
                    }else{
                        User.open().updateById(admin._id, {
                            $set: {
                                freezeFunds: (parseFloat(admin.freezeFunds) -
                                (parseFloat(task.price) + parseFloat(task.price2 ? task.price2 : 0))).toFixed(4)
                            }
                        });
                    }
                });
            //平台管理员
            User.open().updateById(admin._id, {
                $set: {
                    freezeFunds: (parseFloat(admin.freezeFunds) + parseFloat(task.taskerAdminProfit) +
                    parseFloat(task.handerAdminProfit)).toFixed(4)
                }
            });
        });
}

function profitFunds(task) {
    User.open().findOne({username: 'admin'})
        .then(function (admin) {
            var price;
            //做任务者的父级
            if(task.taskUserParentId) {
                price = task.handerChildPrice;
                User.open().findById(task.taskUserParentId)
                    .then(function (taskUserParent) {
                        if(taskUserParent) {
                            User.open().updateById(taskUserParent._id, {
                                $set: {
                                    freezeFunds: (parseFloat(taskUserParent.freezeFunds) -
                                    parseFloat(task.handerParentProfit)).toFixed(4),
                                    funds: (parseFloat(taskUserParent.funds) +
                                    parseFloat(task.handerParentProfit)).toFixed(4)
                                }
                            });
                        }else{
                            User.open().updateById(admin._id, {
                                $set: {
                                    freezeFunds: (parseFloat(admin.freezeFunds) -
                                    parseFloat(task.handerParentProfit)).toFixed(4),
                                    funds: (parseFloat(admin.funds) +
                                    parseFloat(task.handerParentProfit)).toFixed(4)
                                }
                            });
                        }
                    });
            }else{
                price = task.handerParentPrice;
            }
            //做任务者自己
            User.open().findById(task.taskUserId)
                .then(function (taskUser) {
                    if(taskUser) {
                        User.open().updateById(taskUser._id, {
                            $set: {
                                freezeFunds: (parseFloat(taskUser.freezeFunds) - parseFloat(price)).toFixed(4),
                                funds: (parseFloat(taskUser.funds) + parseFloat(price)).toFixed(4)
                            }
                        });
                    }else{
                        User.open().updateById(admin._id, {
                            $set: {
                                freezeFunds: (parseFloat(admin.freezeFunds) - parseFloat(price)).toFixed(4),
                                funds: (parseFloat(admin.funds) + parseFloat(price)).toFixed(4)
                            }
                        });
                    }
                });
            //发布任务者的父级
            if(task.userParentId) {
                User.open().findById(task.userParentId)
                    .then(function (orderUserParent) {
                        if(orderUserParent) {
                            User.open().updateById(orderUserParent._id, {
                                $set: {
                                    freezeFunds: (parseFloat(orderUserParent.freezeFunds) -
                                    parseFloat(task.taskerParentProfit)).toFixed(4),
                                    funds: (parseFloat(orderUserParent.funds) +
                                    parseFloat(task.taskerParentProfit)).toFixed(4)
                                }
                            });
                        }else{
                            User.open().updateById(admin._id, {
                                $set: {
                                    freezeFunds: (parseFloat(admin.freezeFunds) -
                                    parseFloat(task.taskerParentProfit)).toFixed(4),
                                    funds: (parseFloat(admin.funds) +
                                    parseFloat(task.taskerParentProfit)).toFixed(4)
                                }
                            });
                        }
                    });
            }
            //发布任务者自己不需要操作
            //平台管理员
            User.open().updateById(admin._id, {
                $set: {
                    freezeFunds: (parseFloat(admin.freezeFunds) -
                    (parseFloat(task.taskerAdminProfit) + parseFloat(task.handerAdminProfit))).toFixed(4),
                    funds: (parseFloat(admin.funds) + parseFloat(task.taskerAdminProfit) +
                    parseFloat(task.handerAdminProfit)).toFixed(4)
                }
            });
        });
}

Task.open = function() {
    return Task.openCollection('Task');
};

Task.include({
    success: function() {
        var self = this;
        return new Promise(function (resolve, reject) {
            Task.open().updateById(self._id, {
                $set: {
                    taskStatus: '完成',
                    successTime: moment().format('YYYY-MM-DD HH:mm:ss')
                }
            });
            profitFunds(self);
            resolve();
        });
    }
});

//(function() {
//    setInterval(function() {
//        console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ': 扫描了一次人工任务审核。');
//        Task.open().find({
//            taskStatus: '待审核'
//        }).then(function(tasks) {
//            followedByPayment(tasks);
//        })
//    }, 1000 * 30);
//})();

function followedByPayment(tasks) {
    if(tasks.length > 0) {
        var task = tasks.shift();
        var taskCreateTime = task._id.getTimestamp();
        var timeNow = new Date().getTime();
        if((timeNow - taskCreateTime) > 1000 * 60 * 60) {
            var taskIns = Task.wrapToInstance(task);
            taskIns.success().then(function () {
                console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ': 自动审核通过了任务' + task._id);
                followedByPayment(tasks);
            });
        }else{
            console.log('没有过期的审核任务，继续循环下一个任务。---------------------------------');
            followedByPayment(tasks);
        }
    }
}

module.exports = Task;