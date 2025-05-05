'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      message_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      chat_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chats', 
          key: 'chat_id', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message_type: {
        type: Sequelize.ENUM('TEXT', 'IMAGE', 'VIDEO', 'FILE'),
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('SENT', 'DELIVERED', 'READ'),
        allowNull: false,
        defaultValue: 'SENT',
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  },
};