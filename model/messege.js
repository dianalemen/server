const mongoose = require('mongoose');

//Note Schema
const MessageSchema = mongoose.Schema({
    body: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: String
    }
});

let newMessage = module.exports = mongoose.model('Message', MessageSchema);

module.exports.createMessage = function(newMessage) {
    newMessage.save();
};