const moment = require('moment-timezone');

/**
 * Retorna uma data UTC a partir de um termo como 'hoje', 'ontem', ou uma data no formato DD/MM/YYYY
 * @param {string} timeframe
 * @returns {{ date: moment.Moment, isOverdue: boolean, error?: string }}
 */
function parseTimeframe(timeframe) {
    const saoPauloTZ = 'America/Sao_Paulo';
    const today = moment.tz(saoPauloTZ).startOf('day');
    const sevenDaysAgo = moment.tz(saoPauloTZ).subtract(7, 'days').startOf('day');

    if (!timeframe || timeframe === 'hoje') {
        return { date: today.utc(), isOverdue: false };
    }

    if (timeframe === 'ontem') {
        return { date: today.clone().subtract(1, 'day').utc(), isOverdue: true };
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(timeframe)) {
        const parsedDate = moment.tz(timeframe, 'DD/MM/YYYY', saoPauloTZ).startOf('day');

        if (!parsedDate.isValid()) {
            return { date: null, isOverdue: false, error: '❌ Data inválida fornecida no formato DD/MM/YYYY.' };
        }

        if (parsedDate.isAfter(today)) {
            return { date: null, isOverdue: false, error: '❌ A data não pode ser no futuro.' };
        }

        if (parsedDate.isBefore(sevenDaysAgo)) {
            return { date: null, isOverdue: false, error: '❌ A data não pode ser inferior a 7 dias passados.' };
        }

        return { date: parsedDate.utc(), isOverdue: true };
    }

    return { date: null, isOverdue: false, error: '❌ Formato inválido de data. Use "ontem" ou DD/MM/YYYY.' };
}

/**
 * Extrai categoria e timeframe de uma mensagem no formato "ta pago <categoria> [data|ontem]"
 * @param {string} message
 * @returns {{ category: string, timeframe?: string, error?: string }}
 */
function extractCategoryAndTimeframe(message) {
    const parts = message.trim().split(' ');

    if (parts.length < 3) {
        return { category: null, error: '❌ Formato inválido. Use: ta pago <categoria> [data|ontem]' };
    }

    const category = parts[2];
    const timeframe = parts[3];

    return { category, timeframe };
}

module.exports = {
    parseTimeframe,
    extractCategoryAndTimeframe
};
