const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');

const ChallengeCategory = sequelize.define('ChallengeCategory', {
    challengeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creationTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
});

// Exporte o modelo sem associações ainda
module.exports = ChallengeCategory;
