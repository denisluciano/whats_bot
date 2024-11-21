const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    checkIns: [{
        date: Date,
        language: String
    }]
});

const Ranking = mongoose.model('Ranking', rankingSchema);

module.exports = Ranking;
