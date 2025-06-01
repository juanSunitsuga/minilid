'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_appliers', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'job_posts',
          key: 'job_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      applier_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'appliers',
          key: 'applier_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cv_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cover_letter: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('applied', 'interviewing', 'rejected'),
        allowNull: false,
        defaultValue: 'applied'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_appliers');
  }
};
