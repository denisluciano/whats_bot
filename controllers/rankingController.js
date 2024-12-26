const moment = require('moment-timezone');
const Checkin = require('../models/checkin');
const User = require('../models/user');

const getRanking = async (context) => {
    // Obtém a data de hoje e o início do ano em horário BRT
    const today = moment().tz('America/Sao_Paulo').startOf('day');
    const startOfYear = moment().tz('America/Sao_Paulo').startOf('year');

    // Função para contar check-ins únicos por atividade
    const countUniqueCheckIns = (checkIns) => {
        const uniqueEntries = new Map();
        checkIns.forEach((checkIn) => {
            const date = moment(checkIn.date).tz('America/Sao_Paulo').format('YYYY-MM-DD');
            const key = `${checkIn.activity}-${date}`;
            uniqueEntries.set(key, true);
        });
        return uniqueEntries.size;
    };

    // Busca todos os check-ins da categoria específica
    const allCheckIns = await Checkin.find({ category: context });

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
            const filteredCheckIns = userCheckIns.filter(
                (checkIn) => moment(checkIn.date).tz('America/Sao_Paulo').isSameOrAfter(startOfYear)
            );
            return {
                userId,
                totalCheckIns: countUniqueCheckIns(filteredCheckIns),
            };
        })
        .sort((a, b) => b.totalCheckIns - a.totalCheckIns);

    // Adiciona os nomes dos usuários ao ranking
    for (const entry of rankingAnual) {
        const user = await User.findOne({ userId: entry.userId });
        entry.userName = user ? user.userName : 'Usuário desconhecido';
    }

    // Monta a mensagem de ranking
    let rankingMessage = `*Ranking ${context}*

`;
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

    return rankingMessage || '⚠️ Não há check-ins registrados nesta categoria.';
};

module.exports = { getRanking };
