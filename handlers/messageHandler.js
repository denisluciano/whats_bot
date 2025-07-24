const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const { normalizeText } = require('../utils/textUtils');
const { Op } = require('sequelize');
const { Challenge, ChallengeCategory, User } = require('../models/associations');
const { handleAddCategoryCommand, handleListCategoriesCommand } = require('../controllers/categoryController');

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
        include: [{ model: ChallengeCategory, as: 'categories' }]
    });

    if (!challenge) {
        return; // Grupo não possui um desafio ativo
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');
        const whatsappId = message.author || message.from;
        const userName = message._data.notifyName;

        const [user] = await User.findOrCreate({
            where: { whatsappId },
            defaults: { userName, creationTime: utcNow.toDate() }
        });

        if (!category) {
            client.sendMessage(message.from, `❌ Formato inválido de check-in. Exemplos válidos: *ta pago <categoria>*, *ta pago <categoria> 01/01/2025* ou *ta pago <categoria> ontem*`);
            return;
        }

        // Define a data do check-in
        let date = utcNow;
        let isOverdue = false;

        if (timeframe) {
            if (timeframe === 'ontem') {
                date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
                isOverdue = true;
            } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(timeframe)) {
                const parsedDate = moment.tz(timeframe, 'DD/MM/YYYY', 'America/Sao_Paulo').startOf('day');
                const today = moment.tz('America/Sao_Paulo').startOf('day');
                const sevenDaysAgo = moment.tz('America/Sao_Paulo').subtract(7, 'days').startOf('day');
        
                if (!parsedDate.isValid()) {
                    client.sendMessage(message.from, `❌ Data inválida fornecida no formato DD/MM/YYYY.`);
                    return;
                }
        
                if (parsedDate.isAfter(today)) {
                    client.sendMessage(message.from, `❌ A data não pode ser no futuro.`);
                    return;
                }
        
                if (parsedDate.isBefore(sevenDaysAgo)) {
                    client.sendMessage(message.from, `❌ A data não pode ser inferior a 7 dias passados.`);
                    return;
                }
        
                date = parsedDate.utc();
                isOverdue = true;
            } else {
                client.sendMessage(message.from, `❌ Formato inválido de check-in. Exemplos válidos: *ta pago <categoria>*, *ta pago <categoria> 01/01/2025* ou *ta pago <categoria> ontem*`);
                return;
            }
        }

        await processCheckIn(client, message, user.id, userName, challenge, category, date, isOverdue);

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