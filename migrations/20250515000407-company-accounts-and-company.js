'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Step 1: Create the new consolidated company table
    await queryInterface.createTable('companies', {
      company_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true
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

    // Step 2: Migrate data from existing tables
    const companies = await queryInterface.sequelize.query(
      `SELECT * FROM companies`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const companyAccounts = await queryInterface.sequelize.query(
      `SELECT * FROM company_accounts`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Combine data and insert into new table
    for (const company of companies) {
      const matchingAccount = companyAccounts.find(
        account => account.company_id === company.company_id
      );
      
      if (matchingAccount) {
        await queryInterface.sequelize.query(`
          INSERT INTO companies (
            company_id, 
            company_name, 
            company_email, 
            password, 
            address, 
            website,
            created_at,
            updated_at
          )
          VALUES (
            '${company.company_id}',
            '${company.company_name.replace(/'/g, "''")}',
            '${matchingAccount.company_email.replace(/'/g, "''")}',
            '${matchingAccount.password.replace(/'/g, "''")}',
            ${company.address ? `'${company.address.replace(/'/g, "''")}'` : null},
            ${company.website ? `'${company.website.replace(/'/g, "''")}'` : null},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);
      }
    }

    await queryInterface.dropTable('company_accounts');
    await queryInterface.dropTable('companies');
  },

  async down(queryInterface, Sequelize) {
    // Step 1: Recreate the original tables
    await queryInterface.createTable('company', {
      company_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });

    await queryInterface.createTable('company_accounts', {
      company_email: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'company',
          key: 'company_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    // Step 2: Migrate data back to the original tables
    try {
      const combinedCompanies = await queryInterface.sequelize.query(
        `SELECT * FROM companies`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      for (const company of combinedCompanies) {
        // Insert into company table
        await queryInterface.sequelize.query(`
          INSERT INTO company (company_id, company_name, address, website)
          VALUES (
            '${company.company_id}',
            '${company.company_name.replace(/'/g, "''")}',
            ${company.address ? `'${company.address.replace(/'/g, "''")}'` : null},
            ${company.website ? `'${company.website.replace(/'/g, "''")}'` : null}
          )
        `);

        // Insert into company_accounts table
        await queryInterface.sequelize.query(`
          INSERT INTO company_accounts (company_email, company_id, password)
          VALUES (
            '${company.company_email.replace(/'/g, "''")}',
            '${company.company_id}',
            '${company.password.replace(/'/g, "''")}'
          )
        `);
      }
    } catch (error) {
      console.log('Error migrating data back:', error.message);
    }

    // Step 3: Drop the new table
    await queryInterface.dropTable('companies');
  }
};
