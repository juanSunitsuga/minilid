'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('applier_skill', {
      applier_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'job_posts',
          key: 'job_id'
        },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      skill_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'skills',
          key: 'skill_id'
        },
        onDelete: 'CASCADE',
        primaryKey: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('applier_skill');
  },
};
