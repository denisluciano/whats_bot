const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    notificationEnabled: Boolean
});

const User = mongoose.model('User', checkinSchema);

module.exports = User;
