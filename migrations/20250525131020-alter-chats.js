'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'job_application_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'job_appliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chats', 'job_application_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: null
    });
  }
};
