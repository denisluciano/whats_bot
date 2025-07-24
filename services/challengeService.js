const Challenge = require('../models/challenge');
const ChallengeCategory = require('../models/challengeCategory');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

// Função para buscar um challenge pelo groupId
async function getChallengeByGroup(groupId) {

    return await Challenge.findOne({
        where: { 
            groupId,
            startDate: { [Op.lte]: moment.utc().toDate() },
            endDate: { [Op.gte]: moment.utc().toDate() }
        },
        include: [{ model: ChallengeCategory, as: 'categories' }] // Inclui as categorias associadas ao desafio
    });
}

// Função para adicionar uma nova categoria ao challenge
async function addCategoryToChallenge(challengeId, category) {
    // Verifica se a categoria já existe no desafio
    const existingCategory = await ChallengeCategory.findOne({
        where: { challengeId, category }
    });

    if (existingCategory) {
        return null; // Categoria já existe
    }

    // Cria uma nova categoria
    return await ChallengeCategory.create({ challengeId, category, creationTime: moment.utc().toDate() });
}

async function getAllCategoriesByGroup(groupId) {
    const challenge = await getChallengeByGroup(groupId);

    if (!challenge || !challenge.categories || challenge.categories.length === 0) {
        return null;
    }

    return challenge.categories.map(cat => cat.category);
}

module.exports = { getChallengeByGroup, addCategoryToChallenge, getAllCategoriesByGroup  };
