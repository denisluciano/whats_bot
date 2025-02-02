const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notificationEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    creationTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = User;
