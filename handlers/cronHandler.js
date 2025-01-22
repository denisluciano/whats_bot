const moment = require('moment-timezone');
const { processCheckIn } = require('../controllers/checkinController');
const { getRanking } = require('../controllers/rankingController');
const { normalizeText } = require('../utils/textUtils');
const Challenge = require('../models/challenge');


const cronHandleMessage = async (client, command) => {

    // Pega a data UTC atual
    let utcNow = moment.utc(); // Momento atual em UTC

    // Encontrar o desafio 
    const challenge = await Challenge.findOne({
        'groupId': groupId,
        'startDate': {
            $lte: utcNow,    
        },
        'endDate': {
            $gte: utcNow,    
        },
    });

    if (!challenge) {
        return; // grupo não possui um desafio ativo
    }

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');
        const userId = message.author || message.from;
        const userName = message._data.notifyName;

        //verificando se é uma categoria válida
        activity = challenge.activity

        if(!challenge.categories.includes(category)) {
            client.sendMessage(message.from, `A categoria *"${category}"* não é aceito para a atividade de *${activity}*. Por favor, use uma das seguintes categorias: *${challenge.categories.join(', ')}*.`);
            return
        }

        // Define a data com base no "ontem" ou "hoje"
        let date = utcNow;
        let isOverdue = false;
        
        if (timeframe === 'ontem') {
            date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
            isOverdue = true;
        }

        await processCheckIn(client, message, userId, userName, challenge, category, date, isOverdue);

    } else if (normalizedMessage === '!ranking') {
        
        rankingMessage = await getRanking(challenge);

        client.sendMessage(message.from, rankingMessage);
    }
};

module.exports = { cronHandleMessage };
