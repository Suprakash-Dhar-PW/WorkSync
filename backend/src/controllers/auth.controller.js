const bcrypt = require('bcrypt');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];

    // For demo purposes, if password is plain text in DB (legacy) vs bcrypt
    // The prompt says "Validate email + password (bcrypt)". Assuming DB has hashed passwords.
    // However, if I am testing, I might not have hashed passwords in the DB yet unless I seed them.
    // The user said "DATABASE (ALREADY CREATED)". Did they seed it?
    // "create table users..." doesn't show inserts.
    // I should assume standard bcrypt compare.

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    let groupId = null;
    if (user.role === 'sub_admin') {
      const [groups] = await db.query('SELECT id FROM groups_master WHERE sub_admin_id = ?', [user.id]);
      if (groups.length > 0) groupId = groups[0].id;
    }

    // Embed groupId in token if needed, or just standard fields
    const token = generateToken({ id: user.id, role: user.role, groupId });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        groupId
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
