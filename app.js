var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var mconnect = require('./config/connect.js');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var port = process.env.PORT || 7070;
var app = express();
var https = require('https');
var fs = require('fs');
require('./config/passport');

if(mconnect.connection.readyState === 2){
	console.log("ket noi thanh cong vs mongoose !"); // Kiểm tra kết nối với mongoose
}

// Setup engine template website 
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session(
    {
      secret: 'mysupersecret', 
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({mongooseConnection: mconnect.connection}),
      cookie: {
        maxAge: 1800 * 60 * 1000
      }
    }
));

// var httpsOptions = {
//     key: fs.readFileSync('./privkey.pem'),
//     cert: fs.readFileSync('./cert.pem'),
//     requestCert: true,
//     rejectUnauthorized: false
// };
//
// const server = https.createServer(httpsOptions,app);

app.use(flash());

// app.use(session({
//   secret: "thisismysession"
// }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
	res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
	next();
});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);

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

app.use('/public', express.static('public'));

app.listen(port, function(){
	 console.log('Server listening at port %d',port);
});

module.exports = app;
