// models/ChallengeCategory.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');
const Challenge = require('./challenge');

const ChallengeCategory = sequelize.define('ChallengeCategory', {
    challengeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Challenge,
            key: 'id'
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creationTime: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = ChallengeCategory;