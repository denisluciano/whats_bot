const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const { normalizeText } = require('../utils/textUtils');
const { parseTimeframe, extractCategoryAndTimeframe } = require('../utils/dateUtils');
const { Op } = require('sequelize');
const { Challenge, ChallengeCategory } = require('../models/associations'); 
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
        include: [{ model: ChallengeCategory }] 
    });

    if (!challenge) {
        return; // Grupo não possui um desafio ativo
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const { category, timeframe, error } = extractCategoryAndTimeframe(normalizedMessage);
        const userId = message.author || message.from;
        const userName = message._data.notifyName;

        if (error || !category) {
            client.sendMessage(message.from, error || '❌ Categoria não informada.');
            return;
        }

        const { date, isOverdue, error: dateError } = parseTimeframe(timeframe);
        if (dateError) {
            client.sendMessage(message.from, dateError);
            return;
        }

        await processCheckIn(client, message, userId, userName, challenge, category, date, isOverdue);

    } else if (normalizedMessage === '!ranking') {
        const rankingMessage = await getRanking(challenge);
        client.sendMessage(message.from, rankingMessage);

    } else if (normalizedMessage.startsWith('!addcategoria')) {
        await handleAddCategoryCommand(message, client);

    } else if (normalizedMessage === '!todascategorias') {
        await handleListCategoriesCommand(message, client);

    } else if (normalizedMessage === 'recontar' && message.hasQuotedMsg) {

        const ADMIN_NUMBER = '553198256660@c.us'; // Apenas este número pode adicionar categorias
        const senderNumber = message.author || message.from;

        if (!senderNumber.includes(ADMIN_NUMBER)) {
            await client.sendMessage(message.from, '⚠️ Você não tem permissão para adicionar categorias.');
            return;
        }

        const quotedMsg = await message.getQuotedMessage();
        const userId = quotedMsg.author || quotedMsg.from;
        const userName = quotedMsg._data?.notifyName || 'Usuário';
        const normalizedQuoted = normalizeText(quotedMsg.body);

        const { category, timeframe, error } = extractCategoryAndTimeframe(normalizedQuoted);

        if (error || !category) {
            client.sendMessage(message.from, error || '❌ Categoria não identificada na mensagem original.');
            return;
        }

        // Usa a data da mensagem original se não houver timeframe explícito
        const referenceDate = moment.unix(quotedMsg.timestamp).tz('America/Sao_Paulo').startOf('day');

        const { date, isOverdue, error: dateError } = parseTimeframe(timeframe);
        const finalDate = timeframe ? date : referenceDate.utc();
        const finalOverdue = timeframe ? isOverdue : false;

        if (dateError) {
            client.sendMessage(message.from, dateError);
            return;
        }

        await processCheckIn(client, quotedMsg, userId, userName, challenge, category, finalDate, finalOverdue);
    }
};

module.exports = { handleMessage };