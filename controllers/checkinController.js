const moment = require('moment-timezone');
const Checkin = require('../models/checkin');
const User = require('../models/user');

const processCheckIn = async (client, message, userId, userName, challenge, category, dateUTC, isOverdue) => {
    // Converte a data UTC para o horário do Brasil (BRT)
    const dateBRT = moment(dateUTC).tz('America/Sao_Paulo');

    // Ajusta o início e o fim do dia no horário do Brasil (BRT), depois converte para UTC
    const startOfDay = dateBRT.clone().startOf('day').utc().toDate();
    const endOfDay = dateBRT.clone().endOf('day').utc().toDate();

    // Verifica se o usuário já existe
    const userAlreadyExist = await User.findOne({
        'userId': userId
    });

    if(!userAlreadyExist){
        // Cria um novo usuário
        const newUser = new User({
            'userId': userId,
            'userName': userName,
            'notificationEnabled': true,
            'creationTime': moment.utc()
        });

        await newUser.save();
    }

    // Verifica se o usuário já fez check-in na mesma atividade, categoria e data
    const alreadyCheckedIn = await Checkin.findOne({
        'userId': userId,
        'challengeId': challenge._id,
        'category': category,
        'date': {
            $gte: startOfDay, // Início do dia em UTC
            $lt: endOfDay,    // Fim do dia em UTC
        },
    });

    // console.log('Check-in encontrado:', alreadyCheckedIn);

    formatedDateBRT = dateBRT.format('DD/MM/YYYY')

    if (alreadyCheckedIn) {
        client.sendMessage(
            message.from,
            `⚠️ ${userName}, você *já fez* um check-in para atividade *${challenge.activity}* na categoria *${category}* em *${formatedDateBRT}*.`
        );
        return;
    }

    // Cria um novo check-in
    const newCheckIn = new Checkin({
        'userId': userId,
        'challengeId': challenge._id,
        'category': category,
        'date': dateUTC, // Armazena a data original em UTC
        'isOverdue': isOverdue,
        'creationTime': moment.utc()
    });

    await newCheckIn.save();

    client.sendMessage(
        message.from,
        `🥳 *Parabéns* ${userName}! Check-in registrado para atividade *${challenge.activity}* na categoria *${category}* na data de *${formatedDateBRT}*!`
    );
};

module.exports = { processCheckIn };
