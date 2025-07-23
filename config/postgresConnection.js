const { Sequelize } = require('sequelize');
require('dotenv').config();

// Centralized database configuration
const dbConfig = require('./config')[process.env.NODE_ENV || 'development'];

// Use connection URI from environment variable combined with shared options
const sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);


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
