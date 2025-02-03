const Challenge = require('./challenge');
const ChallengeCategory = require('./ChallengeCategory');

// Definir as associações aqui, após os modelos serem carregados
Challenge.hasMany(ChallengeCategory, { foreignKey: 'challengeId' });
ChallengeCategory.belongsTo(Challenge, { foreignKey: 'challengeId' });

module.exports = { Challenge, ChallengeCategory };