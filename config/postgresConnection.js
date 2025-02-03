const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
    dialect: 'postgres',
    logging: false,
    timezone: 'UTC',
    define: {
        timestamps: false,
      },
});

const connectToPostgreSQL = async () => {
    try {
        console.log('🟡 Tentando conectar ao PostgreSQL...');
        await sequelize.authenticate();
        console.log('✅ Conectado ao PostgreSQL!');
    } catch (err) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    }
};

module.exports = { sequelize, connectToPostgreSQL };
