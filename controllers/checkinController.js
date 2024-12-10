const Checkin = require('../models/checkin');
const { DateToBrt } = require('../utils/dateUtils');
const { formatDateToBrazilian } = require('../utils/dateUtils');

const processCheckIn = async (client, message, userId, userName, activity, category, date) => {
    const date_brt_format = formatDateToBrazilian(DateToBrt(date));

    // Verifica se o usuário já fez check-in na mesma atividade, categoria e data
    const alreadyCheckedIn = await Checkin.findOne({
        userId,
        activity,
        category,
        date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)), // Início do dia
            $lt: new Date(date.setHours(23, 59, 59, 999)), // Fim do dia
        },
    });

    if (alreadyCheckedIn) {
        client.sendMessage(
            message.from,
            `⚠️ ${userName}, você *já fez* um check-in para *${activity}* na categoria *${category}* em *${date_brt_format}*.`
        );
        return;
    }

    // Cria um novo check-in
    const newCheckIn = new Checkin({
        userId,
        activity,
        category,
        date,
    });

    await newCheckIn.save();

    client.sendMessage(
        message.from,
        `🥳 *Parabéns* ${userName}! Check-in registrado para *${activity}* na categoria *${category}* na data de *${date_brt_format}*!`
    );
};

module.exports = { processCheckIn };
