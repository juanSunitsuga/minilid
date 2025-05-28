'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Modify the status column to use ENUM type with predefined values
    await queryInterface.addColumn('interview_schedules', 'status', {
      type: Sequelize.ENUM('ACCEPTED', 'DECLINED', 'PENDING'),
      allowNull: false,
      defaultValue: 'PENDING'
    });
  },

  async down (queryInterface, Sequelize) {
    // First, remove the ENUM constraint
    await queryInterface.removeColumn('interview_schedules', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PENDING'
    });
    
    // Drop the ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_interview_schedules_status";'
    );
  }
};
