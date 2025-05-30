'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chats', {
      chat_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      applier_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recruiter_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      last_message: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chats');
  },
};