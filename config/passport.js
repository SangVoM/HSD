var passport = require('passport');
var User = require('../models/user');
var Group = require('../models/group');
const Notify = require('../models/notification');
var Setting = require('../models/setting');
let ObjectId = require('mongodb').ObjectId;
const d = new Date();
const timeStamp = d.getTime();

//google and facebook
var configAuth = require('./auth');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

//truy van phone
passport.serializeUser(function (user, done) {
    done(null, user.phone);
});

passport.deserializeUser(function(phone, done){
    User.findOne({phone: phone},
        function(err, user){
            done(err, user);
        });
});
/*--------------------------------------------------------
Đăng ký thành viên và khởi tạo các bảng dữ liệu mặc định
--------------------------------------------------------*/

    passport.use('local.signup', new LocalStrategy({
        usernameField: 'phone',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, phone, password, done) {
        req.checkBody('phone', 'Số điện thoại không hợp lệ').notEmpty();
        req.checkBody('phone', 'Số điện thoại có vẻ đã bị thiếu').isLength({min: 10});
        req.checkBody('password', 'Mật khẩu không hợp lệ, ít nhất 6 ký tự').notEmpty().isLength({min: 6});
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });

            return done(null, false, req.flash('error', messages));
        }
        User.findOne({'phone': phone}, function (err, user) {

            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, {message: 'Số điện thoại đã được dùng !'});
            }

            let newUser = new User();
            newUser.phone = phone;
            newUser.password = newUser.encryptPassword(password);
            newUser.create_at = timeStamp;
            newUser.save(function (err, result) {
                if (err) {
                    return done(err);
                }
                return done(null, newUser);
            });

            let newGroup = new Group();
            newGroup.name = "Default";
            newGroup.owner = newUser.id;
            newGroup.listuser = [];
            newGroup.listproduct = [];
            newGroup.listinvited = [];
            newGroup.create_at = timeStamp;
            newGroup.save();

            // // Khởi tạo bảng Notification
            //
            // let newNotify = new Notify();
            // newNotify.type = '0';
            // newNotify.idUser = newUser.id;
            // newNotify.content = "Hãy thêm thật nhiều sản phẩm để quản lý hạn sử dụng nhé !";
            // newNotify.watched = 0;
            // newNotify.create_at = timeStamp;
            // newNotify.save();

            // Khởi tạo bảng setting

            let newSetting = new Setting();
            newSetting.timetolarm = 0;
            newSetting.timezone = 0;
            newSetting.typeofsound = 0;
            newSetting.frame_time = [];
            newSetting.create_at = timeStamp;
            newSetting.user_id = newUser.id;
            newSetting.save();

            User.findOneAndUpdate({"_id": ObjectId(newUser.id)}, {setting: newSetting.id, $push: {"listgroup": newGroup.id}},{new : true, upsert: true}, function(err, docs){
                if(err){
                    throw err;
                }else{
                    return docs;
                }
            });

        });
    }));

    /*--------------------------------------------------------
                                Đăng nhập
    --------------------------------------------------------*/
    passport.use('local.signin', new LocalStrategy({
        usernameField: 'phone',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, phone, password, done) {
        req.checkBody('phone', 'Số điện thoại không hợp lệ !').notEmpty().isLength({min: 10});
        req.checkBody('password', ' Mật khẩu không chính xác').notEmpty().isLength({min: 5});
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });

            return done(null, false, req.flash('error', messages));
        }

        User.findOne({'phone': phone}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'User không tồn tại !'});
            }

            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Sai mật khẩu!'});
            }

            return done(null, user);
        });
    }));

/*--------------------------------------------------------
                            Đăng nhập facebook
--------------------------------------------------------*/

passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            User.findOne({"phone": profile.id}, function(err,user) {
                if(err)
                    return done(err);
                if(user){
                    return done(null, user);
                }else{
                    var d = new Date();
                    var timeStamp = d.getTime();
                    var type_login = 1;
                    let newUser = new User();
                    newUser.phone = profile.id;
                    newUser.type_login = type_login;
                    newUser.tokenfirebase = accessToken;
                    newUser.create_at = timeStamp;
                    newUser.save(function(err){
                        if(err){
                            throw err;
                        }else{
                            let newGroup = new Group();
                            newGroup.name = "Default";
                            newGroup.owner = newUser.id;
                            newGroup.listuser = [];
                            newGroup.listproduct = [];
                            newGroup.listinvited = [];
                            newGroup.create_at = timeStamp;
                            newGroup.save();
                            // console.log("newGroup.name: "+newGroup.id);

                            //khoi tao notication
                            let newNotify = new Notify();
                            newNotify.type = '3';
                            newNotify.idUser = newUser.id;
                            newNotify.content = "Hãy thêm thật nhiều sản phẩm để quản lý hạn sử dụng nhé !";
                            newNotify.watched = 1;
                            newNotify.create_at = timeStamp;
                            newNotify.save();
                            console.log("newNotify.id: "+newNotify.id);

                            // Khởi tạo bảng setting
                            let newSetting = new Setting();
                            newSetting.timetolarm = 0;
                            newSetting.timezone = 0;
                            newSetting.typeofsound = 0;
                            newSetting.frame_time = [];
                            newSetting.create_at = timeStamp;
                            newSetting.user_id = newUser.id;
                            newSetting.save();

                            User.findOneAndUpdate({"_id": ObjectId(newUser.id)},
                                {setting: newSetting.id,
                                    $push: {listgroup: newGroup.id, listnotification: newNotify.id}
                                },
                                {new : true}, function(err, docs){
                                    if(err){
                                        throw err;
                                    }else{
                                        return done(null, docs);
                                    }
                                });
                        }
                    });
                    return newUser;
                }
            });
        });
    }
));
/*--------------------------------------------------------
                            Đăng nhập google
--------------------------------------------------------*/
passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            User.findOne({"phone": profile.id}, function(err,user) {
                if(err)
                    return done(err);
                if(user){
                    return done(null, user);
                }else{
                    var d = new Date();
                    var timeStamp = d.getTime();
                    var type_login = 1;
                    let newUser = new User();
                    newUser.phone = profile.id;
                    newUser.type_login = type_login;
                    newUser.tokenfirebase = accessToken;
                    newUser.create_at = timeStamp;
                    newUser.save(function(err){
                        if(err){
                            throw err;
                        }else{
                            let newGroup = new Group();
                            newGroup.name = "Default";
                            newGroup.owner = newUser.id;
                            newGroup.listuser = [];
                            newGroup.listproduct = [];
                            newGroup.listinvited = [];
                            newGroup.create_at = timeStamp;
                            newGroup.save();

                            //khoi tao notication
                            let newNotify = new Notify();
                            newNotify.type = '3';
                            newNotify.idUser = newUser.id;
                            newNotify.content = "Hãy thêm thật nhiều sản phẩm để quản lý hạn sử dụng nhé !";
                            newNotify.watched = 1;
                            newNotify.create_at = timeStamp;
                            newNotify.save();

                            // Khởi tạo bảng setting
                            let newSetting = new Setting();
                            newSetting.timetolarm = 0;
                            newSetting.timezone = 0;
                            newSetting.typeofsound = 0;
                            newSetting.frame_time = [];
                            newSetting.create_at = timeStamp;
                            newSetting.user_id = newUser.id;
                            newSetting.save();

                            User.findOneAndUpdate({"_id": ObjectId(newUser.id)},
                                {setting: newSetting.id,
                                    $push: {listgroup: newGroup.id, listnotification: newNotify.id}
                                    },
                                {new : true}, function(err, docs){
                                if(err){
                                    throw err;
                                }else{
                                    return done(null, docs);
                                }
                            });
                        }
                    });
                    return newUser;
                }
            });
        });
    }
));