const moment = require('moment-timezone');
const { getRanking, listChallenges } = require('../services/backendService');

const cronHandleMessage = async (client, command) => {
    // Pega a data UTC atual
    let utcNow = moment.utc();

    // Buscar desafios via back-end e filtrar os ativos
    const { success, challenges: allChallenges } = await listChallenges();
    if (!success || !allChallenges) {
        return;
    }
    const challenges = allChallenges.filter((c) => {
        const start = moment.utc(c.startDate);
        const end = moment.utc(c.endDate);
        return start.isSameOrBefore(utcNow) && end.isSameOrAfter(utcNow);
    });

    if (!challenges || challenges.length === 0) {
        return; // Nenhum desafio ativo encontrado
    }

    if (command === 'ranking_diario') {
        // Itera sobre os desafios encontrados
        for (const challenge of challenges) {
            try {
                // Obtém o ranking do back-end para o grupo do desafio
                const { message: rankingMessage } = await getRanking({ groupId: challenge.groupId });

                // Envia a mensagem para o grupo associado ao desafio
                if (rankingMessage) {
                    await client.sendMessage(challenge.groupId, rankingMessage);
                }
            } catch (error) {
                console.error(`Erro ao enviar ranking para o desafio ${challenge.id}:`, error);
            }
        }
    }
};

module.exports = { cronHandleMessage };