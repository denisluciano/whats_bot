const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    // Verifica se a mensagem veio de um grupo
    if (message.from.includes('@g.us')) {
        // Verifica se a mensagem é "Tá pago ingles"
        if (message.body.toLowerCase() === 'tá pago ingles') {
            // Responde no grupo com a mensagem
            client.sendMessage(message.from, 'Parabéns, você segue firme nos estudos.');
        }
    }
});

client.initialize();
