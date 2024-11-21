const Ranking = require('../models/ranking');
const { DateToBrt } = require('../utils/dateUtils');

const processCheckIn = async (client, message, userId, userName, activity, context, date) => {
    
    // Encontra o ranking do usuário
    let userRanking = await Ranking.findOne({ userId });

    const date_brt_format = formatDateToBrazilian(DateToBrt(date));

    // Se o usuário não tiver um ranking, cria um novo
    if (!userRanking) {
        userRanking = new Ranking({ userId, userName, checkIns: [{ date, language }] });
        await userRanking.save();
        client.sendMessage(message.from, `🥳 *Parabéns* ${userName}! Check-in registrado para o idioma de *${language}* na data de *${date_brt_format}*!`);
    } else {
        // Verifica se já fez o check-in na data informada para o idioma informado
        const alreadyCheckedIn = userRanking.checkIns.some(checkIn => {
            const checkInDate = new Date(checkIn.date);

            // Evita duplicação de check-ins
            const date_brt = DateToBrt(checkInDate);
            const targetDate_brt = DateToBrt(date);

            return (
                date_brt.getUTCFullYear() == targetDate_brt.getUTCFullYear() &&
                date_brt.getUTCMonth() == targetDate_brt.getUTCMonth() &&
                date_brt.getUTCDate() == targetDate_brt.getUTCDate() &&
                checkIn.language == language
            );
        });

        if (alreadyCheckedIn) {
            client.sendMessage(message.from, `⚠️ ${userName}, você *já fez* seu check-in para o idioma de *${language}* na data de *${date_brt_format}*.`);
        } else {
            // Atualiza o ranking com o novo check-in
            userRanking.checkIns.push({ date, language });
            await userRanking.save();
            client.sendMessage(message.from, `🥳 *Parabéns* ${userName}! Check-in registrado para o idioma de *${language}* na data de *${date_brt_format}*!`);
        }
    }
};

module.exports = { processCheckIn };