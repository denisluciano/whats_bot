const { processCheckIn } = require('../controllers/checkinController');
// const { getRankingMessage } = require('../controllers/rankingController');
const groupContexts = require('../config/groupContexts');
const { normalizeText } = require('../utils/textUtils');
const { getTodayBrt, getStartOfDateBrt, subtractDayOfDate, getUTCNow} = require('../utils/dateUtils');

const handleMessage = async (client, message) => {
    const groupId = message.from;
    const context = groupContexts[groupId];

    normalizedMessage = normalizeText(message.body)

    if (normalizedMessage.startsWith('id do grupo')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    if (!context) { // grupo não está na lista permitida. Não faz nada
        return;
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, activity, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;
        
        utcNow = getUTCNow()

        yesterdayUtc = subtractDayOfDate(utcNow, 1)

        const date = (timeframe === 'ontem') ? getStartOfDateBrt(yesterdayUtc) : getTodayBrt();

        console.log(date)

        //await processCheckIn(client, message, userId, userName, activity, context, date);

    } else if (normalizedMessage === '!ranking') {
        // const rankingMessage = await getRankingMessage(context);
        client.sendMessage(message.from, rankingMessage);
    }
};

module.exports = { handleMessage };
