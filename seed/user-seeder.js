var mongoose = require('mongoose');

mongoose.connect('mongodb://192.168.1.21:27017/hansudung');

var user = require('../models/user');
