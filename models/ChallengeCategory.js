const { sequelize } = require('../config/postgresConnection');
const Challenge = require('./challenge');

const ChallengeCategory = sequelize.define('ChallengeCategory', {
    challengeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Challenge, key: 'id' }
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
