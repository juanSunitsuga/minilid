'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the enum type
    await queryInterface.sequelize.query(`
      CREATE TYPE user_type AS ENUM ('applier', 'recruiter');
    `);

    // Create the new users table
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      usertype: {
        type: 'user_type',
        allowNull: false
      }
    });

    // Migrate appliers data
    const appliers = await queryInterface.sequelize.query(
      `SELECT * FROM appliers`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const applier of appliers) {
      await queryInterface.sequelize.query(`
        INSERT INTO users (user_id, name, email, password, usertype)
        VALUES (
          '${uuidv4()}',
          '${applier.name.replace(/'/g, "''")}',
          '${applier.email.replace(/'/g, "''")}',
          '${applier.password.replace(/'/g, "''")}',
          'applier'
        )
      `);
    }

    // Migrate recruiters data
    const recruiters = await queryInterface.sequelize.query(
      `SELECT * FROM recruiters`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const recruiter of recruiters) {
      await queryInterface.sequelize.query(`
        INSERT INTO users (user_id, name, email, password, usertype)
        VALUES (
          '${uuidv4()}',
          '${recruiter.name.replace(/'/g, "''")}',
          '${recruiter.email.replace(/'/g, "''")}',
          '${recruiter.password.replace(/'/g, "''")}',
          'recruiter'
        )
      `);
    }

    // Drop the old tables
    await queryInterface.dropTable('appliers');
    await queryInterface.dropTable('recruiters');
  },

  async down(queryInterface, Sequelize) {
    // Get the users data before dropping the table
    const users = await queryInterface.sequelize.query(
      `SELECT * FROM users`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Recreate the original tables
    await queryInterface.createTable('appliers', {
      applier_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    await queryInterface.createTable('recruiters', {
      recruiter_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    // Migrate data back to the original tables
    for (const user of users) {
      if (user.usertype === 'applier') {
        await queryInterface.sequelize.query(`
          INSERT INTO appliers (applier_id, name, email, password)
          VALUES (
            '${uuidv4()}',
            '${user.name.replace(/'/g, "''")}',
            '${user.email.replace(/'/g, "''")}',
            '${user.password.replace(/'/g, "''")}'
          )
        `);
      } else {
        await queryInterface.sequelize.query(`
          INSERT INTO recruiters (recruiter_id, name, email, password)
          VALUES (
            '${uuidv4()}',
            '${user.name.replace(/'/g, "''")}',
            '${user.email.replace(/'/g, "''")}',
            '${user.password.replace(/'/g, "''")}'
          )
        `);
      }
    }

    // Drop the users table
    await queryInterface.dropTable('users');

    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE user_type;
    `);
  }
};
