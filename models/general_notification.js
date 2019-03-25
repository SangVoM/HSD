var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var generalSchema = new Schema({
	idGeneral: {type: String},
	title: {type: String},
	description: {type: String},
	watched: {type: Boolean}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('general_notification', generalSchema);