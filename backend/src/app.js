const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/admin', adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;
