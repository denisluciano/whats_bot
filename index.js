const qrcode = require("qrcode");
const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const Ranking = require('./ranking'); // Certifique-se de que o caminho está correto
require('dotenv').config(); // Carrega as variáveis do .env

// Lista de IDs de grupos permitidos
const allowedGroups = [
    '120363345949387736@g.us', // Grupo do ta pago linguas
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
    authStrategy: new LocalAuth(), // Adiciona essa linha para salvar o estado da sessão
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
            
            const today = new Date(); // Mantém a data e a hora atual

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
                    return (
                        checkInDate.getFullYear() === today.getFullYear() &&
                        checkInDate.getMonth() === today.getMonth() &&
                        checkInDate.getDate() === today.getDate() &&
                        checkIn.language === language
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
            const today = new Date();
            const startOfWeek = new Date();
            const startOfMonth = new Date();
            const startOfYear = new Date();

            // Ajustar para o domingo mais próximo (início da semana)
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            startOfYear.setMonth(0, 1); // Janeiro é mês 0, dia 1
            startOfYear.setHours(0, 0, 0, 0);

            // Função para contar check-ins únicos por dia
            const countUniqueCheckIns = (checkIns) => {
                const uniqueDates = new Set();
                checkIns.forEach((checkIn) => {
                    const date = new Date(checkIn.date);
                    const dateKey = date.toISOString().split('T')[0]; // yyyy-mm-dd format
                    uniqueDates.add(dateKey);
                });
                return uniqueDates.size;
            };

            // Ranking Geral (conta todos os check-ins únicos por dia)
            const allRankings = await Ranking.find();
            const rankingGeral = allRankings.map(user => ({
                userName: user.userName,
                totalCheckIns: countUniqueCheckIns(user.checkIns)
            })).sort((a, b) => b.totalCheckIns - a.totalCheckIns);

            // Ranking Anual (considera check-ins únicos por dia a partir do início do ano)
            const rankingAnual = allRankings.map(user => {
                const filteredCheckIns = user.checkIns.filter(checkIn => new Date(checkIn.date) >= startOfYear);
                return {
                    userName: user.userName,
                    totalCheckIns: countUniqueCheckIns(filteredCheckIns)
                };
            }).sort((a, b) => b.totalCheckIns - a.totalCheckIns);

            // Ranking Mensal (considera check-ins únicos por dia a partir do início do mês)
            const rankingMensal = allRankings.map(user => {
                const filteredCheckIns = user.checkIns.filter(checkIn => new Date(checkIn.date) >= startOfMonth);
                return {
                    userName: user.userName,
                    totalCheckIns: countUniqueCheckIns(filteredCheckIns)
                };
            }).sort((a, b) => b.totalCheckIns - a.totalCheckIns);

            // Ranking Semanal (considera check-ins únicos por dia a partir do início da semana)
            const rankingSemanal = allRankings.map(user => {
                const filteredCheckIns = user.checkIns.filter(checkIn => new Date(checkIn.date) >= startOfWeek);
                return {
                    userName: user.userName,
                    totalCheckIns: countUniqueCheckIns(filteredCheckIns)
                };
            }).sort((a, b) => b.totalCheckIns - a.totalCheckIns);

            let rankingMessage = '*Ranking*\n\n';

            rankingMessage += '*Geral:*\n';
            rankingGeral.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.totalCheckIns} check-ins\n`;
            });

            rankingMessage += '\n*Anual:*\n';
            rankingAnual.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.totalCheckIns} check-ins\n`;
            });

            rankingMessage += '\n*Mensal:*\n';
            rankingMensal.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.totalCheckIns} check-ins\n`;
            });

            rankingMessage += '\n*Semanal:*\n';
            rankingSemanal.forEach((user, index) => {
                rankingMessage += `${index + 1}. ${user.userName} - ${user.totalCheckIns} check-ins\n`;
            });

            client.sendMessage(message.from, rankingMessage);
        }

    }
});

client.initialize();