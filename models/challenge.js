const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    groupId: String,
    name: String,
    activity: String,
    categories: [String],
    startDate: Date,
    endDate: Date,
    creationTime: Date

});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
