const { sequelize } = require('../config/postgresConnection');
const User = require('./user');

const Checkin = sequelize.define('Checkin', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    challengeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Challenge, key: 'id' }
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
        allowNull: true
    }
});

module.exports = Checkin;
