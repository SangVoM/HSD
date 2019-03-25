var mongoose = require('mongoose');
var Schema = mongoose.Schema;
	
var notifySchema = new Schema({
	type: {type: String},
	idUser: {type: mongoose.Schema.ObjectId, ref: 'user'},
	id_invite: {type: String},
	id_product: {type: mongoose.Schema.ObjectId, ref: 'product'},
	content: {type: String},
    status_expiry: {type: String},
	watched: {type: Boolean},
	id_gereral: {type: String},
	create_at: {type: Number}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('notification', notifySchema);