const { Op } = require('sequelize');
const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const { normalizeText } = require('../utils/textUtils');
const Challenge = require('../models/challenge');

const handleMessage = async (client, message) => {
    const normalizedMessage = normalizeText(message.body);

    if (normalizedMessage.startsWith('id do grupo')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    const groupId = message.from;
    const utcNow = moment.utc();

    const challenge = await Challenge.findOne({
        where: {
            groupId,
            startDate: { [Op.lte]: utcNow.toDate() },
            endDate: { [Op.gte]: utcNow.toDate() }
        }
    });

    if (!challenge) return;

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;

        if (!challenge.categories.includes(category)) {
            client.sendMessage(message.from, `A categoria *"${category}"* não é aceita.`);
            return;
        }

        let date = utcNow;
        let isOverdue = timeframe === 'ontem';

        await processCheckIn(client, message, userId, userName, challenge, category, date.toDate(), isOverdue);
    }
};

module.exports = { handleMessage };
