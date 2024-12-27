const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    notificationEnabled: Boolean,
    creationTime: Date
});

const User = mongoose.model('User', userSchema);

module.exports = User;
