const qrcode = require("qrcode");
const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const Ranking = require('./ranking'); // Certifique-se de que o caminho está correto
require('dotenv').config(); // Carrega as variáveis do .env

// Lista de IDs de grupos permitidos
const allowedGroups = [
    '120363345949387736@g.us' // Grupo do ta pago linguas
];


// Conecte ao MongoDB Atlas usando a variável de ambiente
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// // Cria um novo cliente do WhatsApp
// const client = new Client({
//     authStrategy: new LocalAuth()
// });

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
    const acceptedLanguages = ['ingles', 'frances', 'italiano', 'espanhol', 'japones'];

    if (message.from.includes('@g.us')) {

        if (normalizedMessage.startsWith('id do grupo')) {
            console.log(`ID do Grupo: ${message.from}`);
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
            if (acceptedLanguages.includes(language)) {
                const today = new Date().setHours(0, 0, 0, 0); // Apenas a data atual

                // Encontra o ranking do usuário
                let userRanking = await Ranking.findOne({ userId });

                // Se o usuário não tiver um ranking, cria um novo
                if (!userRanking) {
                    userRanking = new Ranking({ userId, userName, totalCheckIns: 1, checkIns: [{ date: today, language }] });
                    await userRanking.save();
                    client.sendMessage(message.from, `Parabéns ${userName}, você fez o seu check-in para o idioma ${language}!`);
                } else {
                    // Verifica se já fez o check-in hoje
                    const alreadyCheckedInToday = userRanking.checkIns.some(checkIn => 
                        new Date(checkIn.date).setHours(0, 0, 0, 0) === today
                    );

                    if (alreadyCheckedInToday) {
                        client.sendMessage(message.from, `${userName}, você já fez seu check-in hoje para o idioma ${language}.`);
                    } else {
                        // Atualiza o ranking com o novo check-in
                        userRanking.totalCheckIns += 1;
                        userRanking.checkIns.push({ date: new Date(), language });
                        await userRanking.save();
                        client.sendMessage(message.from, `Parabéns ${userName}, você fez o seu check-in para o idioma ${language}!`);
                    }
                }
            } else {
                client.sendMessage(message.from, `O idioma "${language}" não é aceito. Por favor, use um dos seguintes: ingles, frances, italiano, espanhol, japones.`);
            }
        }

        // Verifica se a mensagem é para exibir ranking
        if (normalizedMessage === '!ranking') {
            const today = new Date();
            const lastWeek = new Date();
            const lastMonth = new Date();
            const lastYear = new Date();

            lastWeek.setDate(today.getDate() - 7);
            lastMonth.setMonth(today.getMonth() - 1);
            lastYear.setFullYear(today.getFullYear() - 1);

            // Ranking Geral
            const rankingGeral = await Ranking.find().sort({ totalCheckIns: -1 });
            // Ranking Anual
            const rankingAnual = await Ranking.find({ 
                'checkIns.date': { $gte: lastYear }
            }).sort({ totalCheckIns: -1 });
            // Ranking Mensal
            const rankingMensal = await Ranking.find({ 
                'checkIns.date': { $gte: lastMonth }
            }).sort({ totalCheckIns: -1 });
            // Ranking Semanal
            const rankingSemanal = await Ranking.find({ 
                'checkIns.date': { $gte: lastWeek }
            }).sort({ totalCheckIns: -1 });

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