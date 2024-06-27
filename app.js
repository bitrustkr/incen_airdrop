require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
global.passport = require("passport");
global.fs = require("fs");
global.LocalStrategy = require("passport-local").Strategy;
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

global.common = require('./library/common');
global.db     = require('./library/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var missionRouter = require('./routes/mission');
var walletRouter = require('./routes/wallet');
var twitterRouter = require('./routes/twitter');
var discordRouter = require('./routes/discord');
var testRouter = require('./routes/test');

var app = express();

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res, next) => {
    console.log("middleware sercure app2 ==> " + req.headers["X-Forwarded-Proto"]);
    console.log("req.protocol == " + req.protocol);

    let protocol = req.headers["X-Forwarded-Proto"] || req.protocol;
    console.log("protocol == " + protocol);

    if (protocol == "http") {
      let to = "https://" + req.headers.host + req.url;
      console.log("to ==> " + to);

      return res.redirect(to);
    }
    next();
  });
}

// mysql session store 생성
var sessionStore = new MySQLStore(db.db_config);

// express session 연결
var sess = {
  secret: "secret key",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge:3600000
  }
};

if(app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use((req,res,next)=>{
	if(process.env.NODE_ENV === 'production' && !req.secure){
    	return res.redirect('https://' + req.headers.host + req.url);
    } else {
  		next();
    }
});

app.use(
    session(sess)
);

// passport 초기화 및 session 연결
app.use(passport.initialize());
app.use(passport.session());

var authLibrary = require('./library/auth');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: /admin/\nDisallow: /store/orders/\n");
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/mission', missionRouter);
app.use('/wallet', walletRouter);
app.use('/twitter', twitterRouter);
app.use('/discord', discordRouter);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
