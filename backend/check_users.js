const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function checkUsers() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users');
    console.log('Users found:', rows.length);
    rows.forEach(u => console.log(`${u.role}: ${u.email}`));
    await connection.end();
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  }
}

checkUsers();
