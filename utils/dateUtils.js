
HOUR_IN_MILLISECONDS = 60 * 60 * 1000

function getUTCNow() {
    return new Date();
}

function DateToBrt(date) {

    return new Date(date.getTime() - 3 * HOUR_IN_MILLISECONDS);
}

function getTodayBrt() {

    const today = new Date();

    return new Date(today.getTime() - 3 * HOUR_IN_MILLISECONDS);
}

function getStartOfDateBrt(date) {

    dateBrt =  new Date(date.getTime() - 3 * HOUR_IN_MILLISECONDS);

    // Cria uma data UTC com ano, mês e dia, garantindo 00:00:00.000
    const startOfDateBrt = new Date(Date.UTC(
        dateBrt.getUTCFullYear(),
        dateBrt.getUTCMonth(),
        dateBrt.getUTCDate()
    ));

    return startOfDateBrt;

}

function getStartOfDayBrt() {

    const today = new Date();

    todayBrt =  new Date(today.getTime() - 3 * HOUR_IN_MILLISECONDS);

    // Cria uma data UTC com ano, mês e dia, garantindo 00:00:00.000
    const startOfDayBrt = new Date(Date.UTC(
        todayBrt.getUTCFullYear(),
        todayBrt.getUTCMonth(),
        todayBrt.getUTCDate()
    ));

    return startOfDayBrt;

}

function formatDateToBrazilian (date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses em JavaScript são baseados em 0 (Janeiro é 0)
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

function subtractDayOfDate(date, numDays) {
    return new Date(date - numDays * 86400000)
}

// Exporta a função para ser usada em outros arquivos
module.exports = { 
    DateToBrt, 
    getTodayBrt, 
    formatDateToBrazilian,
    getStartOfDayBrt, 
    getStartOfDateBrt, 
    getUTCNow,
    subtractDayOfDate
};
