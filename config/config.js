require('dotenv').config();

const common = {
  dialect: 'postgres',
  logging: false,
  timezone: 'UTC',
  define: {
    timestamps: false,
  },
  dialectOptions: { ssl: false },
};

module.exports = {
  development: {
    use_env_variable: 'POSTGRES_URI',
    ...common,
  },
  production: {
    use_env_variable: 'POSTGRES_URI',
    ...common,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
