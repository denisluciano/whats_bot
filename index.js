const qrcode = require("qrcode");
const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const Ranking = require('./ranking'); // Certifique-se de que o caminho está correto
const { DateToBrt, getTodayBrt } = require('./utils');
require('dotenv').config(); // Carrega as variáveis do .env

// Lista de IDs de grupos permitidos
const allowedGroups = [
    //'120363345949387736@g.us', // Grupo do ta pago linguas
    '120363326956975856@g.us' // Grupo de teste
];


// Conecte ao MongoDB Atlas usando a variável de ambiente
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Creating a new instance of the client
const client = new Client({
    puppeteer: {
      // Runs Chrome in headless mode (without a user interface).
      headless: true,
      args: [
        // Disables Chrome's sandboxing features. This is necessary when running
        // Puppeteer in certain environments like Docker containers.
        "--no-sandbox",
        // Additional sandboxing flag to disable setuid sandbox.
        "--disable-setuid-sandbox",
      ],
    },

    // Este código salva a sessão, evitando a necessidade de autenticar novamente a cada execução.
    // No entanto, isso pode causar problemas quando executado em ambientes diferentes, como Local e PRD (Produção).
    // Por exemplo, se a sessão local estiver desconectada, mas a sessão em PRD estiver ativa e processando dados,
    // ao reativar a sessão local, o sistema tentará computar todas as mensagens acumuladas desde a última vez que a sessão local foi desligada.
    // Isso pode gerar inconsistências nos dados, pois as mesmas mensagens podem ser processadas duas vezes ou em ordens diferentes.
    // ------> SE ESSA LINHA ABAIXO ESTIVER DESCOMENTADA, IMPORTANTE:
    // ------> SEMPRE QUE FOR ALTERNAR A EXECUÇÃO EM OUTRO AMBIENTE, DELETAR A PASTA ".wwebjs_auth" ANTES DE RODAR
    authStrategy: new LocalAuth(), 

    // Setting the webVersionCache option
    webVersionCache: {
      // Setting the type as "remote", which means that the WhatsApp Web version will be fetched from a remote URL
      type: "remote",
      // Setting the remote path for the WhatsApp Web version
      remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1017091165-alpha.html",
    },
  });


// This event is fired when whatsapp-web.js generates a new QR code
client.on("qr", async (qr) => {
    // Here we are using the qrcode library to generate a QR Code and save it as a file
    try {
      await qrcode.toFile("./qrcode.png", qr);
      console.log("QR Code saved as qrcode.png");
    } catch (err) {
      console.error(err);
    }
  });

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    // Função para normalizar o texto (remover acentos e deixar minúsculas)
    const normalizeText = (text) => {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    const normalizedMessage = normalizeText(message.body);

    // Lista de idiomas aceitos
    const acceptedLanguages = ['ingles', 'frances', 'italiano', 'espanhol', 'japones', 'russo'];

    if (message.from.includes('@g.us')) {

        if (normalizedMessage.startsWith('id do grupo')) {
            client.sendMessage(message.from, `ID do Grupo: ${message.from}`);
        }

        if (!allowedGroups.includes(message.from)) // Apenas grupos permitidos podem usar o BOT
            return;

        // Verifica se a mensagem é um check-in (começa com "ta pago")
        if (normalizedMessage.startsWith('ta pago')) {
            const userId = message.author || message.from;
            const userName = message._data.notifyName;

            // Obtém o idioma informado (ex.: ingles, frances)
            const language = normalizedMessage.split(' ')[2];

            // Verifica se o idioma é válido
            if (!acceptedLanguages.includes(language)) {
                client.sendMessage(message.from, `O idioma "${language}" não é aceito. Por favor, use um dos seguintes: ${acceptedLanguages.join(', ')}.`);
                return
            }
            
            const today = new Date();

            // Encontra o ranking do usuário
            let userRanking = await Ranking.findOne({ userId });

            // Se o usuário não tiver um ranking, cria um novo
            if (!userRanking) {
                userRanking = new Ranking({ userId, userName, checkIns: [{ date: today, language }] });
                await userRanking.save();
                client.sendMessage(message.from, `Parabéns ${userName}, você fez o seu check-in para o idioma ${language}!`);
            } else {
                // Verifica se já fez o check-in hoje para o idioma informado
                const alreadyCheckedInToday = userRanking.checkIns.some(checkIn => {
                    const checkInDate = new Date(checkIn.date);
                    
                    // Isso aqui é pra não ter inconsistência de fuso horário.
                    // Se não for assim, entre 21-23:59 é possível já fazer check-in
                    const today_brt = getTodayBrt();
                    const checkInDate_brt = DateToBrt(checkInDate);

                    return (
                        checkInDate_brt.getUTCFullYear() == today_brt.getUTCFullYear() &&
                        checkInDate_brt.getUTCMonth() == today_brt.getUTCMonth() &&
                        checkInDate_brt.getUTCDate() == today_brt.getUTCDate() &&
                        checkIn.language == language
                    );
                });

                if (alreadyCheckedInToday) {
                    client.sendMessage(message.from, `${userName}, você já fez seu check-in hoje para o idioma ${language}.`);
                } else {
                    // Atualiza o ranking com o novo check-in, incluindo data e hora
                    userRanking.checkIns.push({ date: today, language });
                    await userRanking.save();
                    client.sendMessage(message.from, `Parabéns ${userName}, você fez o seu check-in para o idioma ${language}!`);
                }
            }

        }

        // Verifica se a mensagem é para exibir ranking
        if (normalizedMessage === '!ranking') {
            const today = getTodayBrt();
            
            const startOfYear = getTodayBrt();

            startOfYear.setMonth(0, 1); // Janeiro é mês 0, dia 1
            startOfYear.setHours(0, 0, 0, 0);

            // Função para contar check-ins únicos por dia
            const countUniqueCheckIns = (checkIns) => {
                const uniqueDates = new Set();
                checkIns.forEach((checkIn) => {
                    const date = new Date(checkIn.date);
                    const dateBrt = DateToBrt(date)
                    const dateKey = dateBrt.toISOString().split('T')[0]; // yyyy-mm-dd format
                    uniqueDates.add(dateKey);
                });
                return uniqueDates.size;
            };

            const allRankings = await Ranking.find();

            // Ranking Anual (considera check-ins únicos por dia a partir do início do ano)
            const rankingAnual = allRankings.map(user => {
                const filteredCheckIns = user.checkIns.filter(checkIn => DateToBrt(new Date(checkIn.date)) >= startOfYear);
                return {
                    userName: user.userName,
                    totalCheckIns: countUniqueCheckIns(filteredCheckIns)
                };
            }).sort((a, b) => b.totalCheckIns - a.totalCheckIns);


            let rankingMessage = '*Ranking desafio 2024*\n\n';

            rankingAnual.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - *${user.totalCheckIns}* check-ins\n`;
            });

            client.sendMessage(message.from, rankingMessage);
        }

        if (normalizedMessage === '!meuscheckins') {
            const userId = message.author || message.from;

            const today = getTodayBrt();
            
            const startOfWeek = getTodayBrt();
            const startOfMonth = getTodayBrt();
            const startOfYear = getTodayBrt();
    
            // Ajustar para o domingo mais próximo (início da semana)
            startOfWeek.setDate(today.getUTCDate() - today.getUTCDay());
            startOfWeek.setHours(0, 0, 0, 0);
    
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
    
            startOfYear.setMonth(0, 1); // Janeiro é mês 0, dia 1
            startOfYear.setHours(0, 0, 0, 0);
    
            // Função para contar check-ins únicos por dia e por idioma
            const countCheckInsByLanguage = (checkIns) => {
                const languageCounts = {};
                checkIns.forEach((checkIn) => {

                    const date = new Date(checkIn.date);
                    const dateBrt = DateToBrt(date)
                    const dateKey = dateBrt.toISOString().split('T')[0]; // yyyy-mm-dd format

                    const language = checkIn.language;
    
                    // Se ainda não houver contagem para esse idioma e data, inicializa
                    if (!languageCounts[language]) {
                        languageCounts[language] = new Set();
                    }
    
                    languageCounts[language].add(dateKey);
                });
    
                // Converte o set de datas únicas para o número de check-ins por idioma
                const result = {};
                for (const language in languageCounts) {
                    result[language] = languageCounts[language].size;
                }
                return result;
            };
    
            // Encontra o ranking do usuário
            let userRanking = await Ranking.findOne({ userId });
            if (!userRanking) {
                client.sendMessage(message.from, 'Você ainda não fez nenhum check-in!');
                return;
            }
    
            // Check-ins filtrados por período
            const allCheckIns = userRanking.checkIns;
            const annualCheckIns = allCheckIns.filter(checkIn => DateToBrt(new Date(checkIn.date)) >= startOfYear);
            const monthlyCheckIns = allCheckIns.filter(checkIn => DateToBrt(new Date(checkIn.date)) >= startOfMonth);
            const weeklyCheckIns = allCheckIns.filter(checkIn => DateToBrt(new Date(checkIn.date)) >= startOfWeek);
    
            // Conta check-ins por idioma e por período
            const generalCounts = countCheckInsByLanguage(allCheckIns);
            const annualCounts = countCheckInsByLanguage(annualCheckIns);
            const monthlyCounts = countCheckInsByLanguage(monthlyCheckIns);
            const weeklyCounts = countCheckInsByLanguage(weeklyCheckIns);
    
            // Monta a mensagem de ranking pessoal
            let rankingMessage = `*Meus check-ins - @${userRanking.userName}*\n\n`;
    
            // Adiciona o ranking geral
            rankingMessage += '*Geral:*\n';
            for (const language of Object.keys(generalCounts)) {
                rankingMessage += `${language.charAt(0).toUpperCase() + language.slice(1)} - ${generalCounts[language]} check-ins\n`;
            }
    
            // Adiciona o ranking anual
            rankingMessage += '\n*Anual:*\n';
            for (const language of Object.keys(annualCounts)) {
                rankingMessage += `${language.charAt(0).toUpperCase() + language.slice(1)} - ${annualCounts[language]} check-ins\n`;
            }
    
            // Adiciona o ranking mensal
            rankingMessage += '\n*Mensal:*\n';
            for (const language of Object.keys(monthlyCounts)) {
                rankingMessage += `${language.charAt(0).toUpperCase() + language.slice(1)} - ${monthlyCounts[language]} check-ins\n`;
            }
    
            // Adiciona o ranking semanal
            rankingMessage += '\n*Semanal:*\n';
            for (const language of Object.keys(weeklyCounts)) {
                rankingMessage += `${language.charAt(0).toUpperCase() + language.slice(1)} - ${weeklyCounts[language]} check-ins\n`;
            }
    
            // Envia a mensagem com o ranking pessoal
            client.sendMessage(message.from, rankingMessage);
        }

    }
});

client.initialize();
