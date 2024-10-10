function DateToBrt(date) {

    return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}

function getTodayBrt() {

    const today = new Date();

    return new Date(today.getTime() - 3 * 60 * 60 * 1000);
}

// Exporta a função para ser usada em outros arquivos
module.exports = { DateToBrt, getTodayBrt };
