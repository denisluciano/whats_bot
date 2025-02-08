const { getChallengeByGroup, addCategoryToChallenge, getAllCategoriesByGroup } = require('../services/challengeService');

const ADMIN_NUMBER = '553198256660@c.us'; // Apenas este número pode adicionar categorias

async function handleAddCategoryCommand(msg, client) {
    const chat = await msg.getChat();
    const senderNumber = msg.author || msg.from;
    const args = msg.body.trim().split(/\s+/);

    if (!senderNumber.includes(ADMIN_NUMBER)) {
        await client.sendMessage(msg.from, '⚠️ Você não tem permissão para adicionar categorias.');
        return;
    }

    if (args.length < 2) {
        await client.sendMessage(msg.from, '⚠️ Uso correto: *!addcategoria <categoria>*');
        return;
    }


    const categoryName = args.slice(1).join(' '); // Pega a categoria digitada
    const challenge = await getChallengeByGroup(chat.id._serialized);

    if (!challenge) {
        await client.sendMessage(msg.from, '⚠️ Nenhum desafio encontrado para este grupo.');
        return;
    }

    // Adiciona a categoria ao desafio
    const categoryAdded = await addCategoryToChallenge(challenge.id, categoryName);

    if (!categoryAdded) {
        await client.sendMessage(msg.from, `⚠️ A categoria *\"${categoryName}\"* já existe neste desafio.`);
        return;
    }

    await client.sendMessage(msg.from, `✅ Categoria *\"${categoryName}\"* adicionada ao desafio com sucesso!`);
}

async function handleListCategoriesCommand(msg, client) {
    const chat = await msg.getChat();
    const challenge = await getChallengeByGroup(chat.id._serialized);

    if (!challenge) {
        await client.sendMessage(msg.from, '🚫 Nenhum desafio encontrado para este grupo.');
        return;
    }

    const categories = await getAllCategoriesByGroup(chat.id._serialized);

    if (!categories || categories.length === 0) {
        await client.sendMessage(msg.from, '📭 Este desafio ainda não possui categorias.');
        return;
    }

    const formattedCategories = categories.join(', ');
    await client.sendMessage(msg.from, `📂 *Categorias do Desafio*:\n\n${formattedCategories}`);
}

module.exports = { handleAddCategoryCommand, handleListCategoriesCommand };
