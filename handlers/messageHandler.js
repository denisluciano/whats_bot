const moment = require('moment-timezone');
const { normalizeText } = require('../utils/textUtils');
const { registerCheckin, getRanking: getRankingFromBackend, addCategory: addCategoryBackend, listCategories } = require('../services/backendService');
const LIMIT_DAYS_RETROACTIVE = process.env.LIMIT_DAYS_RETROACTIVE || 7;

const handleMessage = async (client, message) => {   
    const normalizedMessage = normalizeText(message.body);

    if (normalizedMessage.startsWith('id do grupo')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    const groupId = message.from;
    const whatsAppId = message.author || message.from;
    const userName = message._data.notifyName; // Preciso, pois se for primeiro check-in, o nome do usuário não é salvo
    let utcNow = moment.utc();

    if (normalizedMessage.startsWith('ta pago')) {
        const [_, __, category, timeframe] = normalizedMessage.split(' ');

        if (!category) {
            client.sendMessage(message.from, `❌ Formato inválido de check-in. Exemplos válidos: *ta pago <categoria>*, *ta pago <categoria> 01/01/2025* ou *ta pago <categoria> ontem*`);
            return;
        }

        // Define a data do check-in
        let date = utcNow;
        let isOverdue = false;

        if (timeframe) {
            if (timeframe === 'ontem') {
                date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
                isOverdue = true;
            } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(timeframe)) {
                const parsedDate = moment.tz(timeframe, 'DD/MM/YYYY', 'America/Sao_Paulo').startOf('day');
                const today = moment.tz('America/Sao_Paulo').startOf('day');
                const daysAgo = moment.tz('America/Sao_Paulo').subtract(LIMIT_DAYS_RETROACTIVE, 'days').startOf('day');
        
                if (!parsedDate.isValid()) {
                    client.sendMessage(message.from, `❌ Data inválida fornecida no formato DD/MM/YYYY.`);
                    return;
                }
        
                if (parsedDate.isAfter(today)) {
                    client.sendMessage(message.from, `❌ A data não pode ser no futuro.`);
                    return;
                }
        
                if (parsedDate.isBefore(daysAgo)) {
                    client.sendMessage(message.from, `❌ A data não pode ser inferior a ${LIMIT_DAYS_RETROACTIVE} dias passados.`);
                    return;
                }
        
                date = parsedDate.utc();
                isOverdue = true;
            } else {
                client.sendMessage(message.from, `❌ Formato inválido de check-in. Exemplos válidos: *ta pago <categoria>*, *ta pago <categoria> 01/01/2025* ou *ta pago <categoria> ontem*`);
                return;
            }
        }

        // Chamada ao backend para registrar check-in
        try {
            const response = await registerCheckin({
                groupId,
                whatsAppId,
                userName,
                category,
                dateISO: moment.utc(date).toISOString(),
                isOverdue,
            });

            

            await client.sendMessage(message.from, response.message);
        } catch (err) {
            await client.sendMessage(message.from, '❌ Erro ao comunicar com o servidor. Tente novamente.');
        }

    } else if (normalizedMessage === '!ranking') {
        // Faz request para o backend pedindo o ranking
        try {
            const response = await getRankingFromBackend({ groupId });
            await client.sendMessage(message.from, response.message);
        } catch (err) {
            await client.sendMessage(message.from, '❌ Erro ao buscar o ranking.');
        }

    } else if (normalizedMessage.startsWith('!addcategoria')) {
        // Faz request para o backend pedindo a adição de uma categoria
        const args = message.body.trim().split(/\s+/);
        if (args.length < 2) {
            await client.sendMessage(message.from, '⚠️ Uso correto: *!addcategoria <categoria>*');
            return;
        }
        const senderNumber = message.author || message.from;
        if (!String(senderNumber).includes(ADMIN_NUMBER)) {
            await client.sendMessage(message.from, '⚠️ Você não tem permissão para adicionar categorias.');
            return;
        }
        const categoryName = args.slice(1).join(' ');
        try {
            const response = await addCategoryBackend({ groupId, categoryName });
            await client.sendMessage(message.from, response.message);
        } catch (err) {
            await client.sendMessage(message.from, `❌ Erro ao adicionar a categoria "${categoryName}".`);
        }

    } else if (normalizedMessage === '!todascategorias') {
        // Faz request para o backend pedindo a listagem de todas as categorias
        try {
            const response = await listCategories({ groupId });
            await client.sendMessage(message.from, response.message);
        } catch (err) {
            await client.sendMessage(message.from, '❌ Erro ao listar categorias.');
        }
    }
};

module.exports = { handleMessage };