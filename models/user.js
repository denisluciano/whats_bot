const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');

const User = sequelize.define('User', {
    whatsAppId: {
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
        allowNull: true
    }
    
});

module.exports = User;
