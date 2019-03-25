/*
File name: User.js
File Description: Tất cả chức năng liên quan đến User (thành viên) sẽ viết vào đây. Coder đều phải comment code của mình viết chức năng gì.
Author: Đội ngũ Finger  
*/
'use strict';
const User = require('../models/user');
const Group = require('../models/group');
const Notify = require('../models/notification');
const Setting = require('../models/setting');
const bcrypt = require('bcrypt-nodejs');
let ObjectId = require('mongodb').ObjectId;

/*--------------------------------------------
			Đăng nhập với android
--------------------------------------------*/

exports.loginAndroid = (phone, password, token) =>
    new Promise((resolve, reject) => {
		// console.log("BEAT:" + password);
        User.findOne({"phone" : phone})
            .populate({
                path: 'listgroup listnotification setting',
                select: 'id name owner listuser type_login listproduct status_expiry type idUser id_product tokenfirebase content watched create_at frame_time timezone typeofsound user_id',
                populate: {
                    path: 'listproduct',
                    select: 'id producttype_id createtime expiretime daybefore created_at description namechanged daybefor delete imagechanged',
                    populate: {path: 'producttype_id', select: 'barcode'},
                    match: { "delete" : false}
                }
            })

            .then(users => {
                if(!users){
                    reject({status: 404, message: "Không tìm thấy user !"});
                }else{
                    return users;
                }
            })

            .then(user => {
                let hashPassword = user.password;
                console.log(hashPassword);

                if(bcrypt.compareSync(password, hashPassword)){
                    if(!token){
                        resolve({status: 200, message: "Đăng nhập thành công, không có token", user: user});
                    }else{
                        user.tokenfirebase = token;
                        user.save()
                            .then(()=>{
                                resolve({status: 200, message: "Đăng nhập thành công, có token", user: user});
                            })
                    }

                }else{
                    reject({status: 401, message: "Sai mật khẩu"});
                }
            })

            .catch(err => ({status: 500, message: "Lỗi sever"}));

    });


/*--------------------------------------------
			Đăng ký với android
--------------------------------------------*/
exports.registerAndroid = (phone, password, type, token) =>
    new Promise((resolve, reject) => {
        console.log("bat dau ");
        User.findOne({"phone" : phone})
            .populate({
                path: 'listgroup listnotification setting',
                select: 'id name owner listuser type_login listproduct status_expiry type idUser id_product tokenfirebase content watched create_at frame_time timezone typeofsound user_id',
                populate: {
                    path: 'listproduct',
                    select: 'id producttype_id createtime expiretime daybefore created_at description namechanged daybefor delete imagechanged',
                    populate: {path: 'producttype_id', select: 'barcode'},
                    match: { "delete" : false}
                }
            })
            .then(user =>{
                if(user){
                    if(type == 0){
                        reject({status: 401, message: "Số điện thoại đã được dùng"});
                    }
				    else
                    {
                        // return user;
                        resolve({status: 200, user: user});
                    }
                } else {
                    let d = new Date();
                    let timeStamp = d.getTime();
                    let newUser = new User();
                    newUser.phone = phone;
                    newUser.type_login = type;
                    newUser.tokenfirebase = token;
                    newUser.password = newUser.encryptPassword(password);
                    newUser.create_at = timeStamp;
                    newUser.save()
                        .then(newUser2 =>{
                            let newGroup = new Group();
                            newGroup.name = "Default";
                            newGroup.owner = newUser2.id;
                            newGroup.listuser = [];
                            newGroup.listproduct = [];
                            newGroup.listinvited = [];
                            newGroup.create_at = timeStamp;
                            newGroup.save()
                                .then(newGroup => {
                                    // Khởi tạo bảng Notification
                                    let newNotify = new Notify();
                                    newNotify.type = '3';
                                    newNotify.idUser = newUser2.id;
                                    newNotify.content = "Hãy thêm thật nhiều sản phẩm để quản lý hạn sử dụng nhé !";
                                    newNotify.watched = 1;
                                    newNotify.create_at = timeStamp;
                                    newNotify.save()
                                        .then(newNotify => {
                                            // Khởi tạo bảng setting
                                            let newSetting = new Setting();
                                            newSetting.timetolarm = 0;
                                            newSetting.timezone = 0;
                                            newSetting.typeofsound = 0;
                                            newSetting.frame_time = [];
                                            newSetting.create_at = timeStamp;
                                            newSetting.user_id = newUser2.id;
                                            newSetting.save()
                                                .then(newSetting => {
                                                    User.findOneAndUpdate({"_id": ObjectId(newUser2.id)},{setting: newSetting.id, $push: {listgroup: newGroup.id, listnotification: newNotify.id}},{select : {listgroup: 0, setting: 0},new : true, upsert: true})
                                                        .populate({path: "listnotification"})
                                                        .then(result => {
                                                            resolve({status: 200, message: "Khởi tạo thành công", user: result});
                                                        })
                                                        .catch(err=>{

                                                            reject({status: 500, message: err.message});
                                                        })
                                                })
                                        })
                                })
                        })

                }
               // resolve({status: 200, message: "Khởi tạo thành công", user: newUser});
            })

			.catch(err => {
				reject({status: 500, message: err.message});
			})
	});

/*--------------------------------------------
	Hiển thị tất cả user
--------------------------------------------*/
exports.listAll = () =>
	new Promise((resolve, reject) => {
		user.find({})
		.then(users => {
			if(users.length === 0){
				reject({status: 404, messages: "Không có users nào !"});
			}else{
				return users;
			}
		})
 
		.then(users => {
			resolve(users);
		})

		.catch({status: 500, message: "Lỗi sever"});

	});

/*--------------------------------------------
	Thông tin user
--------------------------------------------*/


