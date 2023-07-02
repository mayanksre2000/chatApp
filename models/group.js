const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String
    },
    isPersonal: {
        type: Boolean,
        default: false
    },
    
});

const Chat = mongoose.model('Group', groupSchema); // it will create a schema or db in mongodb compass

module.exports = Chat;