// models/challenge.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');
const ChallengeCategory = require('./ChallengeCategory');

const Challenge = sequelize.define('Challenge', {
    groupId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    creationTime: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Relação 1:N entre Challenge e ChallengeCategory
Challenge.hasMany(ChallengeCategory, { foreignKey: 'challengeId' });
ChallengeCategory.belongsTo(Challenge, { foreignKey: 'challengeId' });

module.exports = Challenge;