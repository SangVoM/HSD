let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let newsSchema = new Schema({
    title: {type: String},
    alias: {type: String},
    excerpt: {type: String},
    content: {type: String},
    highlight: {type: Number},
    view: {type: Number},
    id_cat: {type: mongoose.Schema.ObjectId, ref: 'category_news'},
    create_at: {type: Date},
    update_at: {type: Date}
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('news', newsSchema);