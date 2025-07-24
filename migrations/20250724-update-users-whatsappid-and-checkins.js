'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Postgres suporta DDL transacional ‑ basta passar o objeto 'transaction'
    await queryInterface.sequelize.transaction(async (t) => {
      // 1. Users.userId -> whatsAppId
      await queryInterface.renameColumn('Users', 'userId', 'whatsAppId', { transaction: t });

      await queryInterface.changeColumn(
        'Users',
        'whatsAppId',
        {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        { transaction: t },
      );

      // 2. Checkins: migrar FK de STRING para INTEGER
      await queryInterface.addColumn(
        'Checkins',
        'userIdInt',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction: t },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE "Checkins" c
        SET "userIdInt" = u.id
        FROM "Users" u
        WHERE c."userId" = u."whatsAppId";
        `,
        { transaction: t },
      );

      await queryInterface.removeColumn('Checkins', 'userId', { transaction: t });

      await queryInterface.renameColumn('Checkins', 'userIdInt', 'userId', { transaction: t });

      await queryInterface.changeColumn(
        'Checkins',
        'userId',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction: t },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      // Reverte a FK em Checkins para STRING → Users.whatsAppId
      await queryInterface.changeColumn(
        'Checkins',
        'userId',
        {
          type: Sequelize.STRING,
          allowNull: true,
          references: { model: 'Users', key: 'whatsAppId' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction: t },
      );

      // Volta Users.whatsAppId → userId
      await queryInterface.renameColumn('Users', 'whatsAppId', 'userId', { transaction: t });

      await queryInterface.changeColumn(
        'Users',
        'userId',
        {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        { transaction: t },
      );
    });
  },
};
