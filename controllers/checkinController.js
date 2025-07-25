const moment = require('moment-timezone');
const Checkin = require('../models/checkin');
const { Op } = require('sequelize');

const processCheckIn = async (client, message, userId, userName, challenge, category, dateUTC, isOverdue) => {
    const dateBRT = moment(dateUTC).tz('America/Sao_Paulo');
    const startOfDay = dateBRT.clone().startOf('day').utc().toDate();
    const endOfDay = dateBRT.clone().endOf('day').utc().toDate();

    // Verifica se a categoria é válida
    const validCategories = challenge.categories?.map(cc => cc.category) || [];
    
    if (!validCategories.includes(category)) {
        client.sendMessage(
            message.from,
            `A categoria *"${category}"* não é aceita para a atividade *${challenge.name}*. Por favor, use uma das seguintes categorias: *${validCategories.join(', ')}*.`
        );
        return;
    }

    const alreadyCheckedIn = await Checkin.findOne({
        where: {
            userId,
            challengeId: challenge.id,
            category,
            date: {
                [Op.between]: [startOfDay, endOfDay]
            }
        }
    });

    if (alreadyCheckedIn) {
        client.sendMessage(
            message.from,
            `⚠️ ${userName}, você *já fez* um check-in para atividade *${challenge.name}* na categoria *${category}* em *${dateBRT.format('DD/MM/YYYY')}*.`
        );
        return;
    }

    // Criando o novo check-in garantindo que a data seja salva em UTC
    await Checkin.create({
        userId,
        challengeId: challenge.id,
        category,
        date: moment.utc(dateUTC).toDate(), // Converte para UTC antes de salvar
        isOverdue,
        creationTime: moment.utc().toDate()
    });

    client.sendMessage(
        message.from,
        `🥳 *Parabéns* ${userName}! Check-in registrado para atividade *${challenge.name}* na categoria *${category}* na data de *${dateBRT.format('DD/MM/YYYY')}*!`
    );
};

module.exports = { processCheckIn };
