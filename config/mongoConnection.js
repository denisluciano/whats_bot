const mongoose = require('mongoose');
require('dotenv').config(); // Carrega variáveis do .env

const connectToMongoDB = async () => {
    try {
        console.log('🟡 Tentando conectar ao MongoDB...');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 60000, // Aumentado para 60 segundos
            socketTimeoutMS: 60000, // Timeout para conexões abertas
            connectTimeoutMS: 60000, // Timeout total da conexão
        });

        console.log('✅ Conectado ao MongoDB!');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    }
};

// Conectar automaticamente ao iniciar a aplicação
connectToMongoDB();

// Exporta a conexão para ser usada em outros arquivos, se necessário
module.exports = connectToMongoDB;
