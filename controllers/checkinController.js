const moment = require('moment-timezone');
const Checkin = require('../models/checkin');
const User = require('../models/user');
const { Op } = require('sequelize');

const processCheckIn = async (client, message, userId, userName, challenge, category, dateUTC, isOverdue) => {
    const dateBRT = moment(dateUTC).tz('America/Sao_Paulo');
    const startOfDay = dateBRT.clone().startOf('day').utc().toDate();
    const endOfDay = dateBRT.clone().endOf('day').utc().toDate();

    console.log("dateBRT:")
    console.log(dateBRT)

    console.log("startOfDay:")
    console.log(startOfDay)

    console.log("endOfDay:")
    console.log(endOfDay)

    let user = await User.findOne({ where: { userId } });

    if (!user) {
        user = await User.create({ 
            userId: userId, 
            userName: userName,
            creationTime: moment.utc().toDate() 
        });
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
            `⚠️ ${userName}, você *já fez* um check-in para atividade *${challenge.activity}* na categoria *${category}* em *${dateBRT.format('DD/MM/YYYY')}*.`
        );
        return;
    }

    console.log("moment.utc(dateUTC).toDate():")
    console.log(moment.utc(dateUTC).toDate())

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
        `🥳 *Parabéns* ${userName}! Check-in registrado para atividade *${challenge.activity}* na categoria *${category}* na data de *${dateBRT.format('DD/MM/YYYY')}*!`
    );
};

module.exports = { processCheckIn };
