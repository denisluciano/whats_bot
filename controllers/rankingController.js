const moment = require('moment-timezone');
const Checkin = require('../models/checkin');
const User = require('../models/user');

const getRanking = async (activity) => {
    // Obtém o início do ano em horário BRT
    const startOfYear = moment().tz('America/Sao_Paulo').startOf('year');

    // Filtra check-ins diretamente no banco de dados
    const allCheckIns = await Checkin.find({
        activity: activity,
        date: { $gte: startOfYear.toDate() },
    });

    // Função para contar check-ins únicos por usuário (1 por dia)
    const countUniqueCheckIns = (checkIns) => {
        const uniqueDays = new Set();
        checkIns.forEach((checkIn) => {
            const date = moment(checkIn.date).tz('America/Sao_Paulo').format('YYYY-MM-DD');
            uniqueDays.add(date); // Adiciona apenas a data ao conjunto
        });
        return uniqueDays.size; // Retorna o número de dias únicos
    };

    // Agrupa check-ins por usuário
    const userCheckinCounts = allCheckIns.reduce((acc, checkIn) => {
        const userId = checkIn.userId;
        if (!acc[userId]) {
            acc[userId] = [];
        }
        acc[userId].push(checkIn);
        return acc;
    }, {});

    // Gera o ranking anual
    const rankingAnual = Object.keys(userCheckinCounts)
        .map((userId) => {
            const userCheckIns = userCheckinCounts[userId];
            return {
                userId,
                totalCheckIns: countUniqueCheckIns(userCheckIns), // Conta apenas dias únicos
            };
        })
        .sort((a, b) => b.totalCheckIns - a.totalCheckIns);

    // Adiciona os nomes dos usuários ao ranking
    for (const entry of rankingAnual) {
        const user = await User.findOne({ userId: entry.userId });
        entry.userName = user ? user.userName : 'Usuário desconhecido';
    }

    year = moment().year()

    // Monta a mensagem de ranking
    let rankingMessage = `*Ranking desafio ${year}*\n\n`;
    let currentPosition = 1;
    let lastCheckIns = null;

    rankingAnual.forEach((user, index) => {
        if (user.totalCheckIns === lastCheckIns) {
            rankingMessage += `${currentPosition}. ${user.userName} - *${user.totalCheckIns}* check-ins\n`;
        } else {
            currentPosition = index + 1;
            rankingMessage += `${currentPosition}. ${user.userName} - *${user.totalCheckIns}* check-ins\n`;
        }
        lastCheckIns = user.totalCheckIns;
    });

    return rankingMessage || '⚠️ Não há check-ins registrados nesta atividade.';
};

module.exports = { getRanking };
