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
        type: Sequelize.STRING(50), 
        allowNull: false,
        unique: true 
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('skills');
  },
};