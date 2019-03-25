var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
	name: {type: String},
	owner: {type: mongoose.Schema.ObjectId, ref: 'user'},
	listuser: [{type: mongoose.Schema.ObjectId, ref: 'user'}],
	listproduct: [{type: mongoose.Schema.ObjectId, ref: 'product'}],
	listinvited: [{type: mongoose.Schema.ObjectId, ref: 'user'}],
	create_at: {type: Number}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('group', groupSchema);