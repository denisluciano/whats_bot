const { processCheckIn } = require('../controllers/checkinController');
const { getRankingMessage } = require('../controllers/rankingController');

const handleMessage = async (client, message) => {
    const groupId = message.from;
    const context = groupContexts[groupId];

    if (!context) {
        client.sendMessage(message.from, '⚠️ Este grupo não está configurado para usar o bot.');
        return;
    }

    const normalizedMessage = message.body.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, activity, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;
        const date = timeframe === 'ontem' ? new Date(Date.now() - 86400000) : new Date();

        await processCheckIn(client, message, userId, userName, activity, context, date);
    } else if (normalizedMessage === '!ranking') {
        const rankingMessage = await getRankingMessage(context);
        client.sendMessage(message.from, rankingMessage);
    } else {
        client.sendMessage(message.from, '⚠️ Comando não reconhecido.');
    }
};

module.exports = { handleMessage };
