'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('recruiters', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('appliers', 'password', {
      type: Sequelize.STRING,
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('recruiters', 'password');
    await queryInterface.removeColumn('appliers', 'password');
  },
};
