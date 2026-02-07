const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // 1. Clear existing data
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE tasks');
    await connection.execute('TRUNCATE TABLE groups_master');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared tables.');

    // 2. Hash passwords
    const password = await bcrypt.hash('password123', 10);

    // 3. Insert Users
    // Main Admin
    const [adminRes] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Main Admin', 'admin@worksync.com', password, 'main_admin']
    );
    console.log('Created Main Admin: admin@worksync.com');

    // Sub Admin
    const [subAdminRes] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Engineering Manager', 'manager@worksync.com', password, 'sub_admin']
    );
    const subAdminId = subAdminRes.insertId;
    console.log('Created Sub Admin: manager@worksync.com');

    // Employee 1
    const [emp1Res] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['John Doe', 'john@worksync.com', password, 'employee']
    );
    const emp1Id = emp1Res.insertId;
    console.log('Created Employee: john@worksync.com');

    // Employee 2
    const [emp2Res] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Jane Smith', 'jane@worksync.com', password, 'employee']
    );
    const emp2Id = emp2Res.insertId;
    console.log('Created Employee: jane@worksync.com');

    // 4. Create Group
    const [groupRes] = await connection.execute(
      'INSERT INTO groups_master (name, sub_admin_id) VALUES (?, ?)',
      ['Engineering Team', subAdminId]
    );
    const groupId = groupRes.insertId;
    console.log('Created Group: Engineering Team');

    // 5. Create Tasks
    await connection.execute(
      'INSERT INTO tasks (title, description, group_id, assigned_to, assigned_by, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Fix Login Bug', 'Resolve the 404 error on login page', groupId, emp1Id, subAdminId, 'pending', new Date(Date.now() + 86400000)]
    );
    await connection.execute(
      'INSERT INTO tasks (title, description, group_id, assigned_to, assigned_by, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Database Optimization', 'Add indexes to tasks table', groupId, emp2Id, subAdminId, 'pending', new Date(Date.now() + 172800000)]
    );
    await connection.execute(
      'INSERT INTO tasks (title, description, group_id, assigned_to, assigned_by, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Update Documentation', 'Write API docs', groupId, emp1Id, subAdminId, 'completed', new Date(Date.now() - 86400000)]
    );

    console.log('Seeded tasks.');

    console.log('--- SEEDING COMPLETE ---');
    console.log('Use password: password123');

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
