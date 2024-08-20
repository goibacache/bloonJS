const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter         = require('./routes/index');
const authorizeRouter     = require('./routes/authorize.js');
const scheduleRouter      = require('./routes/schedule.js');
const scheduleListRouter  = require('./routes/scheduleList.js');

var app = express();

// view engine setup
//app.engine('pug', require('pug').__express)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Enable/disable logger based on env argv length
if (process.argv.length <= 2){ // Two means it's dev
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0, // forever
  etag: true
}));

app.use('/', indexRouter);
app.use('/authorize', authorizeRouter);
app.use('/schedule', scheduleRouter);
app.use('/scheduleList', scheduleListRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: "Error", message: err.message  });
});

module.exports = app;
