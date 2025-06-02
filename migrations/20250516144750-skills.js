'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skills', {
      skill_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    });

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
    await queryInterface.dropTable('skills');
  },
};