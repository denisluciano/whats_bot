const moment = require('moment-timezone');
const { getRanking } = require('../controllers/rankingController');
const Challenge = require('../models/challenge');


const cronHandleMessage = async (client, command) => {

    // Pega a data UTC atual
    let utcNow = moment.utc(); // Momento atual em UTC

    // Encontrar o desafio 
    const challenges = await Challenge.find({
        'startDate': {
            $lte: utcNow,    
        },
        'endDate': {
            $gte: utcNow,    
        },
    });

    if (!challenges || challenges.length === 0) {
        return; // grupo não possui um desafio ativo
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
                console.error(`Erro ao enviar ranking para o desafio ${challenge._id}:`, error);
            }
        }
    }
};

module.exports = { cronHandleMessage };
