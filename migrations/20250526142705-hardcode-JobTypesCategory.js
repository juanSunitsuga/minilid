'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Insert Job Types
    await queryInterface.bulkInsert('job_types', [
      { type: 'Part Time' },
      { type: 'Full Time' },
      { type: 'Contract' },
      { type: 'Internship' },
    ]);

    // Insert Job Categories
    await queryInterface.bulkInsert('job_categories', [
      { category: 'Onsite' },
      { category: 'Online' },
      { category: 'Hybrid' },
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Remove Job Types
    await queryInterface.bulkDelete('job_types', {
      type: ['Part Time', 'Full Time', 'Contract', 'Internship']
    });

    // Remove Job Categories
    await queryInterface.bulkDelete('job_categories', {
      category: ['Onsite', 'Online', 'Hybrid']
    });
  }
};
