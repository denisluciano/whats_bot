require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: 'POSTGRES_URI',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
