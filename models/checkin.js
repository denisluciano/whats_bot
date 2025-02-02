const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');
const User = require('./user');

const Checkin = sequelize.define('Checkin', {
    userId: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: 'userId'
        }
    },
    challengeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isOverdue: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    creationTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Checkin;
