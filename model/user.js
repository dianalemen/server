const mongoose = require('mongoose');

//User Schema
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    }
});

let newUser = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser) {
    newUser.save();
};