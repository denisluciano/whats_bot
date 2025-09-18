const moment = require('moment-timezone');
const { MessageMedia } = require('whatsapp-web.js');
const { normalizeText } = require('../utils/textUtils');
const { generateMonthlyCalendarImage } = require('../utils/calendarImage');
const { registerCheckin, getRanking: getRankingFromBackend, addCategory: addCategoryBackend, listCategories, getUserCheckinsByGroup } = require('../services/backendService');
const LIMIT_DAYS_RETROACTIVE = process.env.LIMIT_DAYS_RETROACTIVE || 7;

const handleMessage = async (client, message) => {   
    const normalizedMessage = normalizeText(message.body);

    if (normalizedMessage.startsWith('!id')) {
        client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
    }

    const groupId = message.from;
    const senderWhatsAppId = message.author || message.from;
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

        if (timeframe) {
            if (timeframe === 'ontem') {
                date = moment.tz('America/Sao_Paulo').subtract(1, 'day').startOf('day').utc();
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
            } else {
                client.sendMessage(message.from, `❌ Formato inválido de check-in. Exemplos válidos: *ta pago <categoria>*, *ta pago <categoria> 01/01/2025* ou *ta pago <categoria> ontem*`);
                return;
            }
        }

        // Chamada ao backend para registrar check-in
        try {
            const response = await registerCheckin({
                groupId,
                senderWhatsAppId,
                userName,
                category,
                date: moment.utc(date).toISOString()
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
        const categoryName = args.slice(1).join(' ');
        try {
            const response = await addCategoryBackend({ groupId, categoryName, senderWhatsAppId });
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
    } else if (normalizedMessage.startsWith('!meuscheckins')) {
        // Gera imagem de calendário com os check-ins do usuário para o desafio ativo
        try {
            // Aceita opcionalmente MM/YYYY como segundo argumento
            const parts = message.body.trim().split(/\s+/);
            let year, month; // month: 1-12
            const tz = 'America/Sao_Paulo';
            const nowTz = moment.tz(tz);
            if (parts.length >= 2 && /^\d{2}\/\d{4}$/.test(parts[1])) {
                const [mm, yyyy] = parts[1].split('/');
                month = parseInt(mm, 10);
                year = parseInt(yyyy, 10);
                if (month < 1 || month > 12) {
                    await client.sendMessage(message.from, '❌ Mês inválido. Use o formato MM/YYYY.');
                    return;
                }
            } else {
                year = nowTz.year();
                month = nowTz.month() + 1; // moment month 0-11
            }

            // Busca check-ins diretamente pela nova rota (também retorna challenge e user)
            const { success: checksOk, checkins, challenge, user, message: checksMsg } = await getUserCheckinsByGroup({ senderWhatsAppId, groupId });
            if (!checksOk) {
                await client.sendMessage(message.from, checksMsg || '❌ Não foi possível obter seus check-ins.');
                return;
            }

            // Filtra check-ins do mês/ano selecionado (DATE puro no banco, sem hora)
            // Para evitar deslocamento de um dia por timezone, interpretamos diretamente na TZ local
            const uniqueDates = Array.from(new Set(checkins || []));
            const daysChecked = [];
            for (const iso of uniqueDates) {
                const dTz = moment.tz(iso, 'YYYY-MM-DD', tz).startOf('day');
                if (dTz.isValid() && dTz.year() === year && dTz.month() + 1 === month) {
                    daysChecked.push(dTz.date());
                }
            }

            const title = `Meus check-ins — ${('0' + month).slice(-2)}/${year}`;
            const displayName = user?.name || userName;
            const pngBuffer = await generateMonthlyCalendarImage({ year, month, checkedDays: daysChecked, title, userName: displayName, challenge });
            const base64 = pngBuffer.toString('base64');
            const media = new MessageMedia('image/png', base64, 'meus-checkins.png');

            const totalInMonth = moment({ year, month: month - 1 }).daysInMonth();
            const caption = `🗓️ Seu calendário de check-ins (${('0'+month).slice(-2)}/${year})\n${challenge?.name ? `🏁 Desafio: ${challenge.name}\n` : ''}✅ Feitos: ${daysChecked.length} / ${totalInMonth}`;

            await client.sendMessage(message.from, media, { caption });
        } catch (err) {
            console.error('Erro em !meuscheckins:', err);
            await client.sendMessage(message.from, '❌ Erro ao gerar seu calendário de check-ins.');
        }
    }
};

module.exports = { handleMessage };