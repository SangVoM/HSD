let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let categorySchema = new Schema({
   name: {type: String},
   alias: {type: String},
   create_at: {type: Number}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('category_news', categorySchema);