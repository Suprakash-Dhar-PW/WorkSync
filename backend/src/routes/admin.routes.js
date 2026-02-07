const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/overview', authenticate, authorize(['main_admin']), adminController.getOverview);

module.exports = router;
