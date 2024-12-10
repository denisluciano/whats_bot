const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
    userId: String,
    activity: String,
    category: String,
    date: Date,
    inOverdue: Boolean //se enviou com a flag de "ontem"
});

const Checkin = mongoose.model('Checkin', checkinSchema);

module.exports = Checkin;
