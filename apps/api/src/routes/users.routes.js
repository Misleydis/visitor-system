const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { validate } = require('../middleware');
const { createUserSchema, approveUserSchema } = require('../validators/schemas');

router.get('/', userController.getUsers);
router.get('/pending', userController.getPendingUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/approve/:id', validate(approveUserSchema), userController.approveUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
