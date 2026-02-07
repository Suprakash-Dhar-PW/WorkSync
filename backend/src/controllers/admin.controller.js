const db = require('../config/db');

exports.getOverview = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
    const [groups] = await db.query('SELECT * FROM groups_master');
    const [tasks] = await db.query('SELECT * FROM tasks');

    res.json({
      users,
      groups,
      tasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
