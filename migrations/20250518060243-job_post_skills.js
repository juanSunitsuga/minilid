'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_post_skills', {
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'job_posts',
          key: 'job_id'
        },
        onDelete: 'CASCADE',
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
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
    await queryInterface.dropTable('job_post_skills');
  },
};
