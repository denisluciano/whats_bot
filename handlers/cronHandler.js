const moment = require('moment-timezone');
const { getRanking } = require('../controllers/rankingController');
const Challenge = require('../models/challenge');
const { Op } = require('sequelize');

const cronHandleMessage = async (client, command) => {
    // Pega a data UTC atual
    let utcNow = moment.utc();

    // Encontrar os desafios ativos
    const challenges = await Challenge.findAll({
        where: {
            startDate: {
                [Op.lte]: utcNow.toDate(), // Desafios que começaram antes ou no momento atual
            },
            endDate: {
                [Op.gte]: utcNow.toDate(), // Desafios que terminam após ou no momento atual
            },
        },
    });

    if (!challenges || challenges.length === 0) {
        return; // Nenhum desafio ativo encontrado
    }

    if (command === 'ranking_diario') {
        // Itera sobre os desafios encontrados
        for (const challenge of challenges) {
            try {
                // Obtém o ranking para o desafio específico
                const rankingMessage = await getRanking(challenge);

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