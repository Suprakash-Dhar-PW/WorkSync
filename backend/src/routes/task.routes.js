const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/my', authenticate, authorize(['employee']), taskController.getMyTasks);
router.patch('/:id/status', authenticate, authorize(['employee']), taskController.updateTaskStatus);
// New Endpoint: Get All Employees (for dropdown)
router.get('/employees', authenticate, authorize(['sub_admin']), taskController.getGroupEmployees);
router.get('/group', authenticate, authorize(['sub_admin']), taskController.getGroupTasks);
router.post('/', authenticate, authorize(['sub_admin']), taskController.createTask);

module.exports = router;
