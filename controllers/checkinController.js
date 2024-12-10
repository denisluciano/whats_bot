const Checkin = require('../models/checkin');
const { DateToBrt } = require('../utils/dateUtils');
const { formatDateToBrazilian } = require('../utils/dateUtils');

const processCheckIn = async (client, message, userId, userName, activity, category, dateUTC) => {
    
    const date_brt_format = formatDateToBrazilian(DateToBrt(dateUTC));

    // Ajusta a data para o início e fim do dia no horário local
    const startOfDay = new Date(dateUTC);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateUTC);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Data :', dateUTC);
    console.log('Início do dia:', startOfDay);
    console.log('Fim do dia:', endOfDay);

    // Verifica se o usuário já fez check-in na mesma atividade, categoria e data
    const alreadyCheckedIn = await Checkin.findOne({
        userId,
        activity,
        category,
        date: {
            $gte: startOfDay, // Início do dia
            $lt: endOfDay,    // Fim do dia
        },
    });

    console.log('Check-in encontrado:', alreadyCheckedIn);

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
        dateUTC,
    });

    // await newCheckIn.save();

    client.sendMessage(
        message.from,
        `🥳 *Parabéns* ${userName}! Check-in registrado para *${activity}* na categoria *${category}* na data de *${date_brt_format}*!`
    );
};

module.exports = { processCheckIn };
