'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attachments', {
      attachment_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  },
};