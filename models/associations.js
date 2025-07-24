const User = require('./user');
const Checkin = require('./checkin');
const Challenge = require('./challenge');
const ChallengeCategory = require('./challengeCategory');

// ----- User <-> Checkin
User.hasMany(Checkin, {
  foreignKey: 'userId',
  as: 'checkins'
});

Checkin.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ----- Challenge <-> Checkin
Challenge.hasMany(Checkin, {
  foreignKey: 'challengeId',
  as: 'checkins'
});

Checkin.belongsTo(Challenge, {
  foreignKey: 'challengeId',
  as: 'challenge'
});

// ----- Challenge <-> ChallengeCategory
Challenge.hasMany(ChallengeCategory, {
  foreignKey: 'challengeId',
  as: 'categories'
});

ChallengeCategory.belongsTo(Challenge, {
  foreignKey: 'challengeId',
  as: 'challenge'
});

module.exports = { User, Checkin, Challenge, ChallengeCategory };
