const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const Ranking = require('./ranking'); // Certifique-se de que o caminho está correto
require('dotenv').config(); // Carrega as variáveis do .env

// Conecte ao MongoDB Atlas usando a variável de ambiente
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Cria um novo cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if (message.from.includes('@g.us')) {
        // Verifica se a mensagem é "Tá pago ingles"
        if (message.body.toLowerCase() === 'tá pago ingles') {
            const userId = message.author || message.from;
            const userName = message._data.notifyName;

            // Atualiza ou cria a pontuação para o autor da mensagem
            const userRanking = await Ranking.findOne({ userId });
            if (userRanking) {
                userRanking.points += 1;
                userRanking.lastUpdated = new Date(); // Atualiza a data
                await userRanking.save();
            } else {
                const newRanking = new Ranking({ userId, userName, points: 1, lastUpdated: new Date() });
                await newRanking.save();
            }

            client.sendMessage(message.from, `Parabéns ${userName}, você ganhou 1 ponto!`);
        }
        
        // Verifica se a mensagem é para exibir ranking geral
        if (message.body.toLowerCase() === '!ranking geral') {
            const ranking = await Ranking.find().sort({ points: -1 });
            let rankingMessage = '*Ranking Geral dos Estudantes*\n\n';
            
            ranking.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.points} pontos\n`;
            });

            client.sendMessage(message.from, rankingMessage);
        }

        // Verifica se a mensagem é para exibir ranking semanal
        if (message.body.toLowerCase() === '!ranking semanal') {
            // Filtra por data dentro da última semana
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const ranking = await Ranking.find({ lastUpdated: { $gte: lastWeek } }).sort({ points: -1 });
            let rankingMessage = '*Ranking Semanal dos Estudantes*\n\n';
            
            ranking.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.points} pontos\n`;
            });

            client.sendMessage(message.from, rankingMessage);
        }

        // Verifica se a mensagem é para exibir ranking mensal
        if (message.body.toLowerCase() === '!ranking mensal') {
            // Filtra por data dentro do último mês
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            const ranking = await Ranking.find({ lastUpdated: { $gte: lastMonth } }).sort({ points: -1 });
            let rankingMessage = '*Ranking Mensal dos Estudantes*\n\n';
            
            ranking.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.points} pontos\n`;
            });

            client.sendMessage(message.from, rankingMessage);
        }
    }
});

client.initialize();
