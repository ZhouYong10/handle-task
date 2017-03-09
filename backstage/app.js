var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var CCAP = require('ccap');
var ccapOld = CCAP();
var ccap = CCAP({
  width: 216,
  height: 76,
  offset: 56,
  quality: 28,
  fontsize: 56,
  generate: function() {
    return ccapOld.get()[0].substr(0, 4);
  }
});
var moment = require('moment');
var bcrypt = require('bcryptjs');

var Utils = require('./models/Utils');
var User = require('./models/User');
var Placard = require('./models/Placard');

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Cleaners = require('./models/Cleaners');
Cleaners.timeOfDay();



passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.open().findById(id)
      .then(function (user) {
        done(null, user);
      }, function (error) {
        done(error, null);
      });
});

passport.use(new LocalStrategy({
  usernameField: 'username' ,
  passwordField: 'password',
  passReqToCallback: true
}, function(req, uname, password, done) {
  var username = uname.replace(/(^\s*)|(\s*$)/g, "");

  if(!req.body.isAuto) {
    //判断验证码
    if(req.body.securityCode.toLowerCase() != req.session.securityCode) {
      return done(null, false, '验证码错误！');
    }
  }

  //实现用户名或邮箱登录
  //这里判断提交上的username是否含有@，来决定查询的字段是哪一个
  //var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
  var criteria = {username: username};
  User.open().findOne(criteria)
      .then(function (user) {
        if (!user){
          return done(null, false, '用户名 ' + username + ' 不存在!');
        }
        bcrypt.compare(password, user.password, function(err, isMatch) {
          if (isMatch) {
            if(user.status == '冻结'){
              done(null, false, '账户已被冻结，请联系上级或管理员！');
            }else{
              done(null, user, '登陆成功！');
            }
          } else {
            done(null, false, '密码错误！');
          }
        });
      }, function (error) {
        done(error, false, '登陆查询用户信息失败！');
      });
}));

function login(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({
        isOK: false,
        message: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      User.open().updateById(user._id, {
        $set: {
          lastLoginTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      }).then(function () {
        var aim = {
          isOK: true
        };
        if(user.role == 'admin') {
          aim.path = '/admin/home';
        }else if (user.role == 'tasker'){
          aim.path = '/tasker/home';
        }else if(user.role == 'hander'){
          aim.path = '/hander/home';
        }
        res.send(aim);
      }, function (error) {
        res.send({
          isOK: false,
          message: '更新用户登陆时间失败： ' + error
        });
      });
    });
  })(req, res, next);
}

var app = express();


// view engine setup
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/static/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'need change'}));
app.use(passport.initialize());
app.use(passport.session());


var Recharge = require('./models/Recharge');
app.get('/auto/recharge', function (req, res) {
  var caseValue = req.query.a;
  switch (caseValue) {
    case "getsn":
      Recharge.getAlipayIds()
          .then(function (ids) {
            res.send(ids);
          });
      break;
    case "report":
      Recharge.updateRecord(req.query.result)
          .then(function (msg) {
            res.end(msg);
          });
      break;
  }
});

app.get('/', function (req, res) {
  res.render('index', {title: '用户登陆'});
});

app.get('/securityImg', function (req, res) {
  var ary = ccap.get();
  req.session.securityCode = ary[0].toLowerCase();
  res.end(ary[1]);
});

/*
* 用户登陆
* */
app.post('/login', function(req, res, next) {
  login(req, res, next);
});

/*
 * 用户注册
 * */
app.get('/sign/in', function (req, res) {
  res.render('signIn', {title: '用户注册'});
});

app.post('/check/username', function (req, res) {
    User.open().findOne({username: req.body.username})
    .then(function(user) {
        if(user) {
            res.send(true);
        }else{
            res.send(false);
        }
    })
});

app.post('/check/securityCode', function (req, res) {
    if(req.body.securityCode != req.session.securityCode) {
        res.send(false);
    }else{
        res.send(true);
    }
});

app.post('/sign/in', function(req, res, next) {
  if(req.body.securityCode != req.session.securityCode) {
    res.send({
      isOK: false,
      message: '验证码错误！'
    });
    return;
  }

  User.open().findOne({username: req.body.username.replace(/(^\s*)|(\s*$)/g, "")})
      .then(function (user) {
        if (user) {
          res.send({
            isOK: false,
            message: '用户名' + req.body.username + '已经存在！'
          });
          return;
        }

        var invitationCode = req.body.invitation;
        var userInfo = {
          username: req.body.username.replace(/(^\s*)|(\s*$)/g, ""),
          password: req.body.password,
          qq: req.body.qq,
          role: req.body.role,
          roleName: User.role[req.body.role]
        };

        if(invitationCode) {
            var userId = Utils.decipher(invitationCode, Utils.invitationKey);
            User.open().findById(userId)
                .then(function (result) {
                    var parent = User.wrapToInstance(result);
                    userInfo.parent = parent.username;
                    userInfo.parentID = parent._id;
                    User.createUser(userInfo, function (user) {
                        parent.addChild(user[0]._id);
                        User.open().updateById(parent._id, {
                            $set: parent
                        }).then(function () {
                            login(req, res, next);
                        });
                    });
                });
        }else {
          User.createUser(userInfo, function () {
            login(req, res, next);
          });
        }
      });
});

//对外公共接口
var Order = require('./models/Order');

global.weichuanmeiOrderNum = 1;
global.dingdingOrderNum = 3;

//丁丁提单
app.get('/wx/like/forward/remote', function (req, res) {
//app.get('/wx/like/forward/remote/get/order', function (req, res) {  //替代丁丁接单的接口地址
  //var num = parseInt(req.query.num);
  //global.forwardNum = num;
  Order.open().findOne({
    type: 'wx',
    smallType: 'read',
    status: '未处理',
    num: {$gt: global.weichuanmeiOrderNum, $lte: global.dingdingOrderNum}
  }).then(function (obj) {
    if(obj && !obj.remote) {
      Order.open().updateById(obj._id, {
        //$set: {remote: 'daiding'}
        $set: {remote: 'dingding'}
      }).then(function() {
        res.send(JSON.stringify({
          id: obj._id,
          address: obj.address,
          read: obj.num,
          like: obj.num2
        }));
      });
    }else{
      res.send(null);
    }
  });
});

app.get('/wx/like/complete/remote', function (req, res) {
//app.get('/wx/like/forward/complete/remote', function (req, res) {  //替代丁丁接单的接口地址
  var status = req.query.status;
  var msg = req.query.msg;
  var orderId = req.query.id;
  var startReadNum = req.query.startReadNum;
  Order.open().findById(orderId)
      .then(function (order) {
        //if(order && order.status == '未处理' && order.remote == 'daiding'){
        if(order && order.status == '未处理' && order.remote == 'dingding'){
          var orderIns = Order.wrapToInstance(order);
          if (status == 1) {
            orderIns.startReadNum = startReadNum;
            orderIns.complete(function () {
              res.end();
            });
          } else {
            orderIns.refund(msg, function() {
              res.end();
            });
          }
        }else {
          res.end();
        }
      })
});



app.get('/new/placard', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var query;
            if(user.role == 'taker'){
                query = {type: {$ne: 'handerPlacard'}};
            }else if(user.role == 'hander'){
                query = {type: {$ne: 'taskerPlacard'}};
            }
            Placard.open().newPlacard(query)
                .then(function (obj) {
                    res.send(obj);
                });
        });
});

//拦截未登录
app.use(function(req, res, next) {
  if(req.isAuthenticated()){
    next();
  }else{
    res.redirect('/');
  }
});

app.get('/tasker/home', function (req, res) {
  User.open().findById(req.session.passport.user)
      .then(function (user) {
        Placard.open().findPages({type: {$ne: 'handerPlacard'}}, (req.query.page ? req.query.page : 1))
            .then(function (obj) {
              res.render('taskerHome', {
                title: '系统公告',
                placards: obj.results,
                pages: obj.pages,
                user: user
              });
            }, function (error) {
              res.send('获取公告列表失败： ' + error);
            });
      });
});

app.get('/hander/home', function (req, res) {
  User.open().findById(req.session.passport.user)
      .then(function (user) {
        Placard.open().findPages({type: {$ne: 'taskerPlacard'}}, (req.query.page ? req.query.page : 1))
            .then(function (obj) {
              res.render('handerHome', {
                title: '系统公告',
                placards: obj.results,
                pages: obj.pages,
                user: user
              });
            }, function (error) {
              res.send('获取公告列表失败： ' + error);
            });
      });
});


app.use('/user', require('./router/user.js'));
app.use('/hander', require('./router/hander.js'));
app.use('/tasker', require('./router/tasker.js'));

app.use('/forum', require('./router/forum.js'));
app.use('/flow', require('./router/flow.js'));
app.use('/WX', require('./router/WX.js'));
app.use('/MP', require('./router/MP.js'));
app.use('/WB', require('./router/WB.js'));
app.use('/parse', require('./router/parse-address.js'));

app.use('/admin', require('./router/admin.js'));







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('======================================');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err);
});


module.exports = app;