const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const { normalizeText } = require('../utils/textUtils');
const { Op } = require('sequelize');
const Challenge = require('../models/challenge');

const handleMessage = async (client, message) => {
    // Normaliza o texto da mensagem
    const normalizedMessage = normalizeText(message.body);

    if (normalizedMessage.startsWith('id do grupo')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    const groupId = message.from;

    // Pega a data UTC atual
    let utcNow = moment.utc();

    // Encontrar o desafio ativo no banco de dados (PostgreSQL)
    const challenge = await Challenge.findOne({
        where: {
            groupId: groupId,
            startDate: { [Op.lte]: utcNow.toDate() },
            endDate: { [Op.gte]: utcNow.toDate() }
        }
    });

    if (!challenge) {
        return; // Grupo não possui um desafio ativo
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;

        // Verifica se a categoria é válida
        if (!challenge.categories.includes(category)) {
            client.sendMessage(
                message.from,
                `A categoria *"${category}"* não é aceita para a atividade *${challenge.activity}*. Por favor, use uma das seguintes categorias: *${challenge.categories.join(', ')}*.`
            );
            return;
        }

        // Define a data do check-in
        let date = utcNow;
        let isOverdue = false;
        
        if (timeframe === 'ontem') {
            date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
            isOverdue = true;
        }

        await processCheckIn(client, message, userId, userName, challenge, category, date.toDate(), isOverdue);

    } else if (normalizedMessage === '!ranking') {
        const rankingMessage = await getRanking(challenge);
        client.sendMessage(message.from, rankingMessage);
    }
};

module.exports = { handleMessage };
