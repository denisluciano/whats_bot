const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const groupContexts = require('../config/groupContexts');
const { normalizeText } = require('../utils/textUtils');

const handleMessage = async (client, message) => {
    const groupId = message.from;
    const activity = groupContexts[groupId];

    // Normaliza o texto da mensagem
    const normalizedMessage = normalizeText(message.body);

    if (normalizedMessage.startsWith('id do grupo')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    if (!activity) {
        return; // grupo não está na lista permitida
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;

        // Pega a data UTC atual
        let utcNow = moment.utc(); // Momento atual em UTC

        // Define a data com base no "ontem" ou "hoje"
        let date = utcNow;
        let isOverdue = false;
        
        if (timeframe === 'ontem') {
            date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
            isOverdue = true;
        }

        // console.log(`Data do check-in em UTC: ${date.format()}`);
        await processCheckIn(client, message, userId, userName, activity, category, date, isOverdue);

    } else if (normalizedMessage === '!ranking') {
        
        rankingMessage = await getRanking(activity);

        client.sendMessage(message.from, rankingMessage);
    }
};

module.exports = { handleMessage };
