const qrcode = require("qrcode");
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');

const { handleMessage } = require('./handlers/messageHandler');
const { cronHandleMessage } = require('./handlers/cronHandler');

const { connectToPostgreSQL } = require('./config/postgresConnection');
const { sequelize } = require('./config/postgresConnection');
require('./models/associations'); // Carrega as associações


connectToPostgreSQL();

sequelize.sync({ alter: true })
    .then(() => console.log('📦 Banco de dados sincronizado!'))
    .catch(err => console.error('❌ Erro ao sincronizar o banco:', err));

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


    // Agendamento cron
    cron.schedule('30 6 * * *', async () => {

        try {
            // Passa a mensagem simulada para o handler
            await cronHandleMessage(client, 'ranking_diario');
        } catch (error) {
            console.error('Erro ao enviar o cron:', error);
        }
    }, {
        // Define o fuso horário como America/Sao_Paulo
        timezone: "America/Sao_Paulo"
    });

});

client.on('message', async message => {

    await handleMessage(client, message); // Delega ao messageHandler
});

client.initialize();
