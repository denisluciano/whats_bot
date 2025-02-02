const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgresConnection');

const Challenge = sequelize.define('Challenge', {
    groupId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

module.exports = Challenge;
