const { sequelize } = require('../config/postgresConnection');

// Defina o modelo primeiro, sem associar
const Challenge = sequelize.define('Challenge', {
    groupId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
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
    },
});

// Exporte sem associações ainda
module.exports = Challenge;
