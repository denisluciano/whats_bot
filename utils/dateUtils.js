function DateToBrt(date) {

    return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}

function getTodayBrt() {

    const today = new Date();

    return new Date(today.getTime() - 3 * 60 * 60 * 1000);
}

function formatDateToBrazilian (date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses em JavaScript são baseados em 0 (Janeiro é 0)
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

function getUTCDate () {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// Exporta a função para ser usada em outros arquivos
module.exports = { DateToBrt, getTodayBrt, formatDateToBrazilian, getUTCDate };
