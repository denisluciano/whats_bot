const moment = require('moment-timezone');
const { Op } = require('sequelize');
const Checkin = require('../models/checkin');
const User = require('../models/user');

const getRanking = async (challenge) => {
    // Busca todos os check-ins dentro do período do desafio
    const allCheckIns = await Checkin.findAll({
        where: {
            challengeId: challenge.id,
            date: {
                [Op.between]: [challenge.startDate, challenge.endDate]
            }
        }
    });

    // Função para contar check-ins únicos por dia
    const countUniqueCheckIns = (checkIns) => {
        const uniqueDays = new Set();
        checkIns.forEach((checkIn) => {
            const date = moment(checkIn.date).tz('America/Sao_Paulo').format('YYYY-MM-DD');
            uniqueDays.add(date);
        });
        return uniqueDays.size;
    };

    // Agrupar check-ins por usuário
    const userCheckinCounts = allCheckIns.reduce((acc, checkIn) => {
        const userId = checkIn.userId;
        if (!acc[userId]) {
            acc[userId] = [];
        }
        acc[userId].push(checkIn);
        return acc;
    }, {});

    // Gerar o ranking
    const rankingAnual = Object.keys(userCheckinCounts)
        .map((userId) => ({
            userId,
            totalCheckIns: countUniqueCheckIns(userCheckinCounts[userId])
        }))
        .sort((a, b) => b.totalCheckIns - a.totalCheckIns);

    // Buscar os nomes dos usuários
    for (const entry of rankingAnual) {
        const user = await User.findOne({ where: { id: entry.userId } });
        entry.userName = user ? user.userName : 'Usuário desconhecido';
    }

    // Monta a mensagem de ranking
    let rankingMessage = `*🏆 Ranking do desafio de ${challenge.name} 🏆*\n\n`;
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