const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
//importing express session and connect mongo
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const mongoose = require('mongoose');
const deserializeUser = require('./middleware/deserializeuser');
const routeGuard = require('./middleware/routeguard');

const mongoStore = connectMongo(expressSession);

const indexRouter = require('./routes/index');
//importing the Authentication route
const authenticationRouter = require('./routes/authentication');

const app = express();

// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(join(__dirname, 'public')));
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: true,
  })
);

//set up img visualization
app.use(express.static(process.env.PWD + '/public/images'));

app.use(
  expressSession({
    secret: '12345',
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    },
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60,
    }),
  })
);

app.use(deserializeUser);
app.use('/', indexRouter);

//this app.use has to be before the error handlebar
app.use('/authentication', authenticationRouter);

app.get('/main', routeGuard, (req, res) => {
  console.log('user in main page after logging in');
  res.render('main');
});

app.get('/private', routeGuard, (req, res) => {
  console.log('user in private page after logging in');
  res.render('private');
});

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
