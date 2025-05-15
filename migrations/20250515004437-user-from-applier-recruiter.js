'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create the enum type for user types
    await queryInterface.sequelize.query(`
      CREATE TYPE user_type AS ENUM ('applier', 'recruiter');
    `).catch(err => {
      console.log('Note: Enum might already exist');
    });

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
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Migrate appliers data
    try {
      const appliers = await queryInterface.sequelize.query(
        `SELECT * FROM appliers`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      for (const applier of appliers) {
        await queryInterface.sequelize.query(`
          INSERT INTO users (user_id, name, email, password, usertype)
          VALUES (
            '${applier.applier_id}',
            '${applier.name.replace(/'/g, "''")}',
            '${applier.email.replace(/'/g, "''")}',
            '${applier.password.replace(/'/g, "''")}',
            'applier'
          )
        `);
      }
    } catch (error) {
      console.log('Error migrating appliers data:', error.message);
    }

    // Migrate recruiters data
    try {
      const recruiters = await queryInterface.sequelize.query(
        `SELECT * FROM recruiters`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      for (const recruiter of recruiters) {
        await queryInterface.sequelize.query(`
          INSERT INTO users (user_id, name, email, password, usertype)
          VALUES (
            '${recruiter.recruiter_id}',
            '${recruiter.name.replace(/'/g, "''")}',
            '${recruiter.email.replace(/'/g, "''")}',
            '${recruiter.password.replace(/'/g, "''")}',
            'recruiter'
          )
        `);
      }
    } catch (error) {
      console.log('Error migrating recruiters data:', error.message);
    }

    // Don't drop the old tables yet - do this after confirming the migration worked
    // If you want to drop them now, uncomment these lines:
    // await queryInterface.dropTable('appliers');
    // await queryInterface.dropTable('recruiters');
  },

  async down(queryInterface, Sequelize) {
    // Recreate the original tables if they don't exist
    try {
      await queryInterface.createTable('appliers', {
        applier_id: {
          type: Sequelize.UUID,
          primaryKey: true,
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
    } catch (error) {
      console.log('Appliers table might already exist');
    }

    try {
      await queryInterface.createTable('recruiters', {
        recruiter_id: {
          type: Sequelize.UUID,
          primaryKey: true,
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
    } catch (error) {
      console.log('Recruiters table might already exist');
    }

    // Migrate data back to the original tables
    try {
      const users = await queryInterface.sequelize.query(
        `SELECT * FROM users`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      for (const user of users) {
        if (user.usertype === 'applier') {
          await queryInterface.sequelize.query(`
            INSERT INTO appliers (applier_id, name, email, password)
            VALUES (
              '${user.user_id}',
              '${user.name.replace(/'/g, "''")}',
              '${user.email.replace(/'/g, "''")}',
              '${user.password.replace(/'/g, "''")}'
            )
          `);
        } else {
          await queryInterface.sequelize.query(`
            INSERT INTO recruiters (recruiter_id, name, email, password)
            VALUES (
              '${user.user_id}',
              '${user.name.replace(/'/g, "''")}',
              '${user.email.replace(/'/g, "''")}',
              '${user.password.replace(/'/g, "''")}'
            )
          `);
        }
      }
    } catch (error) {
      console.log('Error migrating data back to original tables:', error.message);
    }

    // Drop the users table
    await queryInterface.dropTable('users');

    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_type;
    `);
  }
};