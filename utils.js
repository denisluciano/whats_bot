function DateToBrt(date) {
    const options = { timeZone: 'America/Sao_Paulo', hour12: false };
    
    // Converte a data passada para o fuso horário de Brasília (BRT)
    const brtDateString = date.toLocaleString('en-US', options);
    
    // Cria um novo objeto Date a partir da string convertida
    const brtDate = new Date(brtDateString);

    return brtDate;
}

function getTodayBrt() {

    const today = new Date();

    const options = { timeZone: 'America/Sao_Paulo', hour12: false };
    
    // Converte a data passada para o fuso horário de Brasília (BRT)
    const brtDateString = today.toLocaleString('en-US', options);
    
    // Cria um novo objeto Date a partir da string convertida
    const brtDate = new Date(brtDateString);

    return brtDate;
}

// Exporta a função para ser usada em outros arquivos
module.exports = { DateToBrt, getTodayBrt };
