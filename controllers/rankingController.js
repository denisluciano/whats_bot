const Checkin = require('../models/checkin');
const User = require('../models/user');
const { DateToBrt, getTodayBrt } = require('../utils/dateUtils');

const getRankingMessage = async (context) => {
    const today = getTodayBrt();
    const startOfYear = getTodayBrt();

    startOfYear.setMonth(0, 1); // Janeiro é mês 0, dia 1
    startOfYear.setHours(0, 0, 0, 0);

    // Função para contar check-ins únicos por atividade
    const countUniqueCheckIns = (checkIns) => {
        const uniqueEntries = new Map();
        checkIns.forEach((checkIn) => {
            const date = DateToBrt(new Date(checkIn.date));
            const dateKey = date.toISOString().split('T')[0]; // Formato yyyy-mm-dd
            const key = `${checkIn.activity}-${dateKey}`;
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
                (checkIn) => DateToBrt(new Date(checkIn.date)) >= startOfYear
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
    let rankingMessage = `*Ranking ${context}*\n\n`;
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

module.exports = { getRankingMessage };
