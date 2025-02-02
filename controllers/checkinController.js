const moment = require('moment-timezone');
const Checkin = require('../models/checkin');
const User = require('../models/user');
const { Op } = require('sequelize');

const processCheckIn = async (client, message, userId, userName, challenge, category, dateUTC, isOverdue) => {
    const dateBRT = moment(dateUTC).tz('America/Sao_Paulo');
    const startOfDay = dateBRT.clone().startOf('day').utc().toDate();
    const endOfDay = dateBRT.clone().endOf('day').utc().toDate();

    let user = await User.findOne({ where: { userId } });

    if (!user) {
        user = await User.create({ userId, userName });
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
            `⚠️ ${userName}, você *já fez* um check-in para atividade *${challenge.activity}* na categoria *${category}* em *${dateBRT.format('DD/MM/YYYY')}*`
        );
        return;
    }

    await Checkin.create({
        userId,
        challengeId: challenge.id,
        category,
        date: dateUTC,
        isOverdue
    });

    client.sendMessage(
        message.from,
        `🥳 *Parabéns* ${userName}! Check-in registrado para atividade *${challenge.activity}* na categoria *${category}* na data de *${dateBRT.format('DD/MM/YYYY')}*!`
    );
};

module.exports = { processCheckIn };
