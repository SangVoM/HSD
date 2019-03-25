'use strict';
const mongoose = require('mongoose');

mongoose.connect('mongodb://45.77.36.109:27017/hansudung', {
    user: "sega",
    pass: "sega4deptrai",
    auth: {
        authdb: 'admin'
    }
});

module.exports = mongoose;