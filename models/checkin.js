const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
    userId: String,
    challengeId: { // Referência ao Challenge
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true // Torne obrigatório se cada checkin precisar estar associado a um desafio
    },
    category: String,
    date: Date,
    isOverdue: Boolean, //se enviou com a flag de "ontem" 
    creationTime: Date
});

const Checkin = mongoose.model('Checkin', checkinSchema);

module.exports = Checkin;
