const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitors');
const { roleCheck, validate } = require('../middleware');
const { registerVisitorSchema, updateVisitorSchema } = require('../validators/schemas');

router.get('/logs', visitorController.getActivityLogs);
router.get('/ticket/:ticketNumber', roleCheck('reception', 'admin', 'security'), visitorController.getByTicket);
router.get('/today', roleCheck('admin', 'security', 'reception'), visitorController.getTodayVisitors);
router.get('/returning', roleCheck('security', 'admin'), visitorController.getReturningVisitors);
router.get('/', roleCheck('admin', 'security'), visitorController.getAllVisitors);

router.post('/', roleCheck('security'), validate(registerVisitorSchema), visitorController.registerVisitor);
router.put('/:id/timeout', roleCheck('security', 'admin'), visitorController.timeoutVisitor);
router.put('/:id/cancel', roleCheck('security', 'admin'), visitorController.cancelVisitor);
router.put('/:id', roleCheck('security'), validate(updateVisitorSchema), visitorController.updateVisitor);
router.delete('/:id', roleCheck('security', 'admin'), visitorController.deleteVisitor);
router.delete('/clear-all', roleCheck('admin'), visitorController.clearAllVisitors);

module.exports = router;
