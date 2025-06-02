'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
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
    
    await queryInterface.bulkInsert('skills', [
      {
        name: 'Node.js'
      },
      {
        name: 'PostgreSQL'
      },
      {
        name: 'TypeScript'
      },
      {
        name: 'Back End'
      },
      {
        name: 'Front End'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('skills', null, {});
    await queryInterface.bulkDelete('job_categories', null, {});
    await queryInterface.bulkDelete('job_types', null, {});
  },
};