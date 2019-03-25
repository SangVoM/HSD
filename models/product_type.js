var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Product_typeSchema = new Schema({
	barcode: {type: String},
	name: {type: String},
	image: {type: String},
	check_barcode: {type: Boolean},
	check_product: {type: Boolean, default: false}, // sản phẩm đã check thì không thay đổi
	create_at: {type: Number}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('product_type', Product_typeSchema);