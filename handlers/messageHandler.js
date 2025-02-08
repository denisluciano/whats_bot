const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const { normalizeText } = require('../utils/textUtils');
const { Op } = require('sequelize');
const { Challenge, ChallengeCategory } = require('../models/associations'); // 🔥 Importação correta!
const { handleAddCategoryCommand, handleListCategoriesCommand  } = require('../controllers/categoryController');

const handleMessage = async (client, message) => {
    const normalizedMessage = normalizeText(message.body);

    if (normalizedMessage.startsWith('id do grupo')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    const groupId = message.from;
    let utcNow = moment.utc();

    // Busca o desafio ativo e inclui as categorias associadas
    const challenge = await Challenge.findOne({
        where: {
            groupId: groupId,
            startDate: { [Op.lte]: utcNow.toDate() },
            endDate: { [Op.gte]: utcNow.toDate() }
        },
        include: [{ model: ChallengeCategory }] // 🔥 Corrigido
    });

    if (!challenge) {
        return; // Grupo não possui um desafio ativo
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;

        // Define a data do check-in
        let date = utcNow;
        let isOverdue = false;
        
        if (timeframe === 'ontem') {
            date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
            isOverdue = true;
        }

        await processCheckIn(client, message, userId, userName, challenge, category, date, isOverdue);

    } else if (normalizedMessage === '!ranking') {
        const rankingMessage = await getRanking(challenge);
        client.sendMessage(message.from, rankingMessage);

    } else if (normalizedMessage.startsWith('!addcategoria')) {
        await handleAddCategoryCommand(message, client);

    } else if (normalizedMessage === '!todascategorias') {
        await handleListCategoriesCommand(message, client);
    }
};

module.exports = { handleMessage };
