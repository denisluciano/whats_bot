const moment = require('moment-timezone');
const Checkin = require('../models/checkin');

const processCheckIn = async (client, message, userId, userName, activity, category, dateUTC, inOverdue) => {
    // Converte a data UTC para o horário do Brasil (BRT)
    const dateBRT = moment(dateUTC).tz('America/Sao_Paulo');

    // Ajusta o início e o fim do dia no horário do Brasil (BRT), depois converte para UTC
    const startOfDay = dateBRT.clone().startOf('day').utc().toDate();
    const endOfDay = dateBRT.clone().endOf('day').utc().toDate();

    console.log('Data em UTC:', dateUTC);
    console.log('Início do dia em UTC:', startOfDay);
    console.log('Fim do dia em UTC:', endOfDay);

    // Verifica se o usuário já fez check-in na mesma atividade, categoria e data
    const alreadyCheckedIn = await Checkin.findOne({
        'userId': userId,
        'activity': activity,
        'category': category,
        'date': {
            $gte: startOfDay, // Início do dia em UTC
            $lt: endOfDay,    // Fim do dia em UTC
        },
    });

    console.log('Check-in encontrado:', alreadyCheckedIn);

    formatedDateBRT = dateBRT.format('DD/MM/YYYY')

    if (alreadyCheckedIn) {
        client.sendMessage(
            message.from,
            `⚠️ ${userName}, você *já fez* um check-in para *${activity}* na categoria *${category}* em *${formatedDateBRT}* no horário BRT.`
        );
        return;
    }

    // Cria um novo check-in
    const newCheckIn = new Checkin({
        'userId': userId,
        'activity': activity,
        'category': category,
        'date': dateUTC, // Armazena a data original em UTC
        'inOverdue': inOverdue
    });

    await newCheckIn.save();

    client.sendMessage(
        message.from,
        `🥳 *Parabéns* ${userName}! Check-in registrado para *${activity}* na categoria *${category}* na data de *${formatedDateBRT}*!`
    );
};

module.exports = { processCheckIn };
