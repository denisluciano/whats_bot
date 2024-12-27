const mongoose = require('mongoose');
require('dotenv').config(); // Carrega as variáveis do .env

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); // Apenas o URI é necessário
        console.log('Conectado ao MongoDB!');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1); // Finaliza a aplicação em caso de erro crítico
    }
};

module.exports = connectToMongoDB;
