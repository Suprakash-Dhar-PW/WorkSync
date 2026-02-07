const db = require('../config/db');

exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT t.id, t.title, t.description, t.status, t.deadline, t.created_at, t.completed_at,
             g.name AS group_name,
             u.name AS assigned_by_name
      FROM tasks t
      JOIN groups_master g ON t.group_id = g.id
      JOIN users u ON t.assigned_by = u.id
      WHERE t.assigned_to = ?
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await db.query(query, [userId]);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'pending' or 'completed'
  const userId = req.user.id;

  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Check if task belongs to user
    const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ? AND assigned_to = ?', [id, userId]);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Task not found or not assigned to you' });
    }

    let query = 'UPDATE tasks SET status = ?';
    const params = [status];

    if (status === 'completed') {
      query += ', completed_at = NOW()';
    } else {
      query += ', completed_at = NULL';
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);

    res.json({ message: 'Task status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGroupEmployees = async (req, res) => {
  // Since there is no direct link between user and group in the schema provided initially (users table has no group_id),
  // but "Sub Admin belongs to exactly one group" and "Can assign tasks only to employees".
  // AND "Can receive tasks from multiple sub-admins".
  // This implies employees are a global pool OR we need to infer relationship.
  // HOWEVER, the user prompt says: "manager tries to create a task in the employee section jhon name would be there".
  // Let's assume for now we list ALL employees.
  // Ideally, we'd have a user_group table, but let's stick to the schema.
  try {
    const [employees] = await db.query("SELECT id, name, email FROM users WHERE role = 'employee'");
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGroupTasks = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT t.*, u.name as assigned_to_name 
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE t.assigned_by = ?
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await db.query(query, [userId]);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, assigned_to, deadline } = req.body;
  const subAdminId = req.user.id;

  console.log('Creating task:', { title, assigned_to, subAdminId, body: req.body });

  if (!title || !assigned_to) {
    return res.status(400).json({ message: 'Title and assigned_to are required' });
  }

  try {
    // 1. Get Group ID for sub_admin
    const [groups] = await db.query('SELECT id FROM groups_master WHERE sub_admin_id = ?', [subAdminId]);
    if (groups.length === 0) {
      console.log('No group found for sub_admin:', subAdminId);
      return res.status(403).json({ message: 'You do not manage any group' });
    }
    const groupId = groups[0].id;
    console.log('Found Group ID:', groupId);

    // 2. Validate employee exists and is 'employee'
    const [users] = await db.query('SELECT id, role FROM users WHERE id = ?', [assigned_to]);
    if (users.length === 0 || users[0].role !== 'employee') {
      console.log('Invalid employee:', assigned_to, users);
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    // 3. Create Task
    const query = `
      INSERT INTO tasks (title, description, group_id, assigned_to, assigned_by, deadline)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    // Ensure deadline is not empty string, set to null if so
    const safeDeadline = deadline ? deadline : null;

    const [result] = await db.query(query, [title, description, groupId, assigned_to, subAdminId, safeDeadline]);

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      group_id: groupId,
      assigned_to,
      assigned_by: subAdminId,
      deadline,
      status: 'pending'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack, sqlMessage: err.sqlMessage });
  }
};
