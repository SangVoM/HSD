var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
	phone: {type: String},
	password: {type: String},
    tokenfirebase : {type:String},
	type_login: {type: Number},
	setting: {type: mongoose.Schema.ObjectId, ref: 'setting'},
	listgroup: [{type: mongoose.Schema.ObjectId, ref: 'group'}],
	listnotification: [{type: mongoose.Schema.ObjectId, ref: 'notification'}],
	count_product: {type: Number},
	image: {type: String},
	name: {type: String},
	count_notification: {type: Number},
	create_at: {type: Number}
});

/* 001 Kiểm tra User đăng nhập trên website */
// tạo mã hóa mật khẩu
userSchema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

// kiểm tra mật khẩu có trùng khớp
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};
/* End 001 */

mongoose.Promise = global.Promise;
module.exports = mongoose.model('user', userSchema);


