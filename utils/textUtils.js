
function normalizeText(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}


// Exporta a função para ser usada em outros arquivos
module.exports = { normalizeText };