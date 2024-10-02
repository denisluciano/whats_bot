const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    points: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now } // Campo para rastrear a data de pontuação
});

const Ranking = mongoose.model('Ranking', rankingSchema);

module.exports = Ranking;
