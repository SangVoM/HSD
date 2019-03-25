var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settingSchema = new Schema({
	timetoalarm: {type: Number},
	timezone: {type: Number},
	typeofsound: {type: Number},
	frame_time: [{type: String}],
	create: {type: Number},
	user_id: {type: mongoose.Schema.ObjectId, ref: 'user'}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('setting', settingSchema);

