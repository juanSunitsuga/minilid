'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_types', {
      type_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
    
    await queryInterface.bulkInsert('job_types', [
      {
        type: 'Part Time'
      },
      {
        type: 'Full Time'
      },
      {
        type: 'Contract'
      },
      {
        type: 'Internship'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('job_types', null, {});
    await queryInterface.dropTable('job_types');
  },
};