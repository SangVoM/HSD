var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inviteSchema = new Schema({
	userinvite: {type: String},
	user_received: {type: String},
	status: {type: Number},
	create_at: {type: Number}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('invite', inviteSchema);