const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    activity: String,
    category: String,
    date: Date,
});

const Checkin = mongoose.model('Checkin', checkinSchema);

module.exports = Checkin;
