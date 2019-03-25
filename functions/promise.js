'use strict';
var user = require('../models/user');

exports.Show = (id) =>
	new Promise((resolve, reject) => {
		console.log('Ok babe promise');
		let ObjectId = require("mongodb").ObjectId;

		user.find({"_id" : ObjectId(id)})

		.then(user => {
			if(user.length === 0){
				reject({status: 404, message: "User không tồn tại !"});	
			}else{
				return user;
			}
		})

		.then(user => {
			resolve(user);
		})

		.catch(err => reject({status: 500, message: "Lỗi sever"}));
	});
