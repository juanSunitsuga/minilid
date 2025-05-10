'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interview_schedules', {
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'job_posts', 
          key: 'job_id', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recruiter_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'recruiters', 
          key: 'recruiter_id', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      datetime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('interview_schedules');
  },
};