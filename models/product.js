var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
	producttype_id: {type: mongoose.Schema.ObjectId, ref: 'product_type'},
	createtime: {type: Number},
	expiretime: {type: Number},
	description: {type: String},
	namechanged: {type: String},
    imagechanged: {type: String},
	daysleft: {type: Number},
	daybefore : {type: Number, default: 2},
	delete: {type: Boolean, default: false}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('product', productSchema);