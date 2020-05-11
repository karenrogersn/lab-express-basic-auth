const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./../models/user');

const authenticationRouter = new express.Router();

//Sing-up handlebars
authenticationRouter.get('/signup', (req, res) => {
  // OK --> console.log('signing up');
  console.log(req.user);
  res.render('signup');
});

authenticationRouter.post('/signup', (req, res) => {
  // OK --> console.log('Signup form was posted to the server');
  const username = req.body.username;
  const password = req.body.password;
  console.log(username, password);
  bcrypt
    .hash(password, 10)
    .then((hashAndSalt) => {
      return User.create({
        username,
        passwordHashAndSalt: hashAndSalt,
      });
    })
    .then((user) => {
      console.log('the user:', user);
      req.session.userId = user._id;
      res.redirect('/');
    })
    .catch((error) => {
      console.log('there was an error in the sign-up process', error);
    });
});

//Sing-in handlebars
authenticationRouter.get('/signin', (req, res) => {
  // OK --> console.log('showing sign-in page');
  res.render('signin');
});

authenticationRouter.post('/signin', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log('username: ', username, 'password: ', password);
  let user;

  User.findOne({ username })
    .then((document) => {
      user = document;
      return bcrypt.compare(password, user.passwordHashAndSalt);
    })
    .then((comparison) => {
      if (comparison) {
        //serializing the user
        req.session.userId = user._id;
        //console.log('im running');
        res.redirect('/'); //if password is = to the one registered, redirect to index page
      } else {
        return Promise.reject(new Error('Incorrect Password'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = authenticationRouter;
