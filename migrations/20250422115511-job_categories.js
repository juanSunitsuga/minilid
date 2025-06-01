'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_categories', {
      category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
    await queryInterface.bulkInsert('job_categories', [
      {
        category: 'Onsite'
      },
      {
        category: 'Online'
      },
      {
        category: 'Hybrid'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('job_categories', null, {});
    await queryInterface.dropTable('job_categories');
  },
};