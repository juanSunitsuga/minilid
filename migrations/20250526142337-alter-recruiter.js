'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('recruiters', 'position', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('recruiters', 'position');
  }
};
