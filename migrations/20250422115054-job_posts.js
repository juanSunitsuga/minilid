'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_posts', {
      job_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      jobtype_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_types',
          key: 'jobtype_id'     
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      jobcategory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_categorys',
          key: 'jobcategory_id'     
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      posted_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_posts');
  },
};