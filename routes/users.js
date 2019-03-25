var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
// var passportfb = require('passport-facebook').Strategy;
var user = require('../models/user');
var csrfProtection = csrf();
router.use(csrfProtection);

/* GET users listing. */
// router.get('/profile', isLoggedIn, function(req, res, next){
// 	res.render('user/profile', {user: req.user, csrfToken: req.csrfToken()});
// });

router.get('/logout', isLoggedIn, function(req, res, next){
	req.logout();
	res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next){
	next();
});

router.get('/signup', function(req, res, next){
	// var messages = req.flash('error');
	// res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
	res.redirect('/download');
});

router.post('/signup', passport.authenticate('local.signup', {
	successRedirect: '/',
	failureRedirect: 'signup',
	failureFlash: true
}));

router.get('/signin', function(req, res, next){
	var messages = req.flash('error');
	res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
	successRedirect: '../product/quan-ly-san-pham',
	failureRedirect: 'signin',
	failureFlash: true
}));

module.exports = router;

// User đã loggin
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

// user chưa login

function notLoggedIn(req, res, next){
	if(!req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}


