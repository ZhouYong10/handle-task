/**
 * Created by zhouyong10 on 2/3/16.
 */
var dbWrap = require('../dbWrap');
var Class = require('./Class');
var bcrypt = require('bcryptjs');
var moment = require('moment');


var User = new Class();

User.roles = ['管理员','顶级代理','超级代理','金牌代理'];

User.extend(dbWrap);

User.extend({
    open: function() {
        return User.openCollection('User');
    },
    getSystemFunds: function() {
        return new Promise(function(resolve, reject) {
            User.open().find().then(function(results) {
                var count = 0;
                results.forEach(function (result) {
                    count += parseFloat(result.funds);
                });
                resolve(count.toFixed(4));
            })
        })
    },
    createUser: function(user, resolve, reject) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        user.funds = 0;
        user.status = '正常';
        user.createTime = moment().format('YYYY-MM-DD HH:mm:ss');

        User.open().insert(user).then(function(result) {
            resolve(result);
        }, function(error) {
            reject(error);
        })
    },
    removeUser: function(id) {
        return new Promise(function(resolve, reject) {
            //获取被删除用户
            User.open().findById(id).then(function(delUser) {
                //如果存在父用户，则获取父用户
                if(delUser.parentID) {
                    User.open().findById(delUser.parentID).then(function(parentUser) {
                        //将被删除用户从父用户中移除
                        var parent = User.wrapToInstance(parentUser);
                        parent.removeChild(id);
                        //如果存在子用户，则将所有被删除用户的子用户添加到被删除用户的父用户中
                        if(delUser.childNum > 0) {
                            parent.children = parent.children.concat(delUser.children);
                            parent.childNum = parent.children.length;
                            for(var i = 0; i < delUser.children.length; i++) {
                                User.open().updateById(delUser.children[i], {
                                    $set: {
                                        parent: parent.username,
                                        parentID: parent._id
                                    }
                                });
                            }
                        }
                        User.open().updateById(parent._id, {$set: parent})
                            .then(function() {
                                User.open().removeById(delUser._id)
                                    .then(function() {
                                        resolve();
                                    })
                            })
                    })
                }else {
                    if(delUser.childNum > 0) {
                        for(var i = 0; i < delUser.children.length; i++) {
                            User.open().updateById(delUser.children[i], {
                                $unset: {
                                    parent:'',
                                    parentID: ''
                                }
                            });
                        }
                    }
                    User.open().removeById(delUser._id)
                        .then(function() {
                            resolve();
                        })
                }
            })
        })
    },
    resetPassword: function(id) {
       return new Promise(function(resolve) {
           User.open().updateById(id, {
               $set: {
                   password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10))
               }
           }).then(function() {
               resolve();
           })
       })
    }
});

User.include({
    isAdmin: function() {
        return this.role === '管理员';
    },
    samePwd: function(pwd) {
        return bcrypt.compareSync(pwd, this.password);
    },
    childRole: function() {
        var roles = this.parent.roles;
        for(var i = 0; i < roles.length; i++) {
            if(roles[i] === this.role) {
                if(i + 1 < roles.length) {
                    return roles[i + 1];
                }
                return roles[i];
            }
        }
    },
    addChild: function(id) {
        if(this.children == undefined) {
            this.children = [];
        }
        this.children.unshift(id);
        this.childNum = this.children.length;
    },
    removeChild: function(id) {
        var index = -1;
        for(var i = 0; i < this.children.length; i++) {
            if(this.children[i] == id) {
                index = i;
            }
        }
        if(index != -1) {
            this.children.splice(index, 1);
            this.childNum = this.children.length;
        }
    }
});


module.exports = User;