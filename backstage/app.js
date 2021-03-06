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
          isLogin: true,
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

app.get('/sign/readme', function(req, res) {
    res.render('readme', {title: '用户注册协议'});
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

app.post('/sign/in', function (req, res, next) {
    var info = req.body;
    if(!info.readme) {
        res.send({
            isOK: false,
            field: 'readme',
            message: '请阅读并同意《用户注册协议》！'
        });
        return;
    }
    if (info.securityCode != req.session.securityCode) {
        res.send({
            isOK: false,
            field: 'securityCode',
            message: '验证码错误！'
        });
        return;
    }
    if(info.username.replace(/(^\s*)|(\s*$)/g, "") == ''){
        res.send({
            isOK: false,
            field: 'username',
            message: '用户名不能为空！'
        });
        return;
    }
    if(info.password == ''){
        res.send({
            isOK: false,
            field: 'password',
            message: '密码不能为空！'
        });
        return;
    }
    if(info.password !== info.repassword){
        res.send({
            isOK: false,
            field: 'repassword',
            message: '两次输入的密码不一致！'
        });
        return;
    }
    if(!(/^[0-9]*[1-9][0-9]*$/.test(info.qq)) || 5 > info.qq.length || info.qq.length > 13){
        res.send({
            isOK: false,
            field: 'qq',
            message: '请输入5 - 13位的合法ＱＱ号！'
        });
        return;
    }

    User.open().findOne({username: info.username.replace(/(^\s*)|(\s*$)/g, "")})
        .then(function (user) {
            if (user) {
                res.send({
                    isOK: false,
                    field: 'username',
                    message: '用户名: ' + info.username + ' 已经存在！'
                });
                return;
            }

            var invitationCode = info.invitation;
            var userInfo = {
                username: info.username.replace(/(^\s*)|(\s*$)/g, ""),
                password: info.password,
                qq: info.qq,
                role: info.role,
                readme: info.readme,
                roleName: User.role[info.role]
            };

            if (invitationCode) {
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
            } else {
                User.createUser(userInfo, function () {
                    login(req, res, next);
                });
            }
        });
});

//对外公共接口
app.get('/new/placard', function (req, res) {
    User.open().findById(req.session.passport.user)
        .then(function (user) {
            var query;
            if(user.role == 'tasker'){
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

app.get('/auto/recharge/to/user', function (req, res) {
    var info = req.query;
    User.open().findById(info.userId).then(function (user) {
        if (user) {
            User.open().updateById(user._id, {
                $set: {
                    funds: (parseFloat(user.funds) + parseFloat(info.funds)).toFixed(4)
                }
            }).then(function () {
                res.send('ok');
            })
        } else {
            res.send('no');
        }
    });
});

//拦截未登录
app.use(function(req, res, next) {
    if(req.isAuthenticated()){
        User.open().findById(req.session.passport.user).then(function (user) {
            if(user.status == '冻结') {
                res.redirect('/');
            }else{
                next();
            }
        });
    }else{
        res.redirect('/');
    }
});

global.loginNum = 218;

app.get('/tasker/home', function (req, res) {
    User.open().find({isLogin: true}).then(function (users) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                Placard.open().findPages({type: {$ne: 'handerPlacard'}}, (req.query.page ? req.query.page : 1))
                    .then(function (obj) {
                        res.render('taskerHome', {
                            title: '系统公告',
                            placards: obj.results,
                            pages: obj.pages,
                            user: user,
                            loginNum: global.loginNum + users.length * 3
                        });
                    }, function (error) {
                        res.send('获取公告列表失败： ' + error);
                    });
            });
    });
});

app.get('/hander/home', function (req, res) {
    User.open().find({isLogin: true}).then(function (users) {
        User.open().findById(req.session.passport.user)
            .then(function (user) {
                Placard.open().findPages({type: {$ne: 'taskerPlacard'}}, (req.query.page ? req.query.page : 1))
                    .then(function (obj) {
                        res.render('handerHome', {
                            title: '系统公告',
                            placards: obj.results,
                            pages: obj.pages,
                            user: user,
                            loginNum: global.loginNum + users.length * 3
                        });
                    }, function (error) {
                        res.send('获取公告列表失败： ' + error);
                    });
            });
    });
});


app.use('/user', require('./router/user.js'));
app.use('/hander', require('./router/hander.js'));
app.use('/tasker', require('./router/tasker.js'));
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