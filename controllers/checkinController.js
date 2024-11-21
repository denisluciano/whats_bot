const Ranking = require('../models/ranking');
const { DateToBrt } = require('../utils/dateUtils');

const processCheckIn = async (client, message, userId, userName, activity, context, date) => {
    const dateBrtFormat = DateToBrt(date).toISOString().split('T')[0];
    let userRanking = await Ranking.findOne({ userId });

    if (!userRanking) {
        userRanking = new Ranking({
            userId,
            userName,
            checkIns: [{ date, category: context, activity }],
        });
        await userRanking.save();
        client.sendMessage(
            message.from,
            `🥳 *Parabéns* ${userName}! Check-in registrado para *${activity}* no grupo de *${context}* na data de *${dateBrtFormat}*!`
        );
    } else {
        const alreadyCheckedIn = userRanking.checkIns.some(checkIn => {
            const checkInDate = DateToBrt(new Date(checkIn.date));
            const targetDateBrt = DateToBrt(date);

            return (
                checkInDate.getUTCFullYear() === targetDateBrt.getUTCFullYear() &&
                checkInDate.getUTCMonth() === targetDateBrt.getUTCMonth() &&
                checkInDate.getUTCDate() === targetDateBrt.getUTCDate() &&
                checkIn.category === context &&
                checkIn.activity === activity
            );
        });

        if (alreadyCheckedIn) {
            client.sendMessage(
                message.from,
                `⚠️ ${userName}, você já fez seu check-in para *${activity}* no grupo de *${context}* na data de *${dateBrtFormat}*.`
            );
        } else {
            userRanking.checkIns.push({ date, category: context, activity });
            await userRanking.save();
            client.sendMessage(
                message.from,
                `🥳 *Parabéns* ${userName}! Check-in registrado para *${activity}* no grupo de *${context}* na data de *${dateBrtFormat}*!`
            );
        }
    }
};

module.exports = { processCheckIn };