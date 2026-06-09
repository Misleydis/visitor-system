const { registerVisitor } = require('./registerVisitorController');
const { updateVisitor } = require('./updateVisitorController');
const { deleteVisitor } = require('./deleteVisitorController');
const { timeoutVisitor, cancelVisitor } = require('./visitorActionsController');
const { getByTicket, getTodayVisitors, getAllVisitors, getReturningVisitors } = require('./queryVisitorsController');
const { getActivityLogs } = require('./activityLogController');

module.exports = {
  registerVisitor,
  updateVisitor,
  deleteVisitor,
  timeoutVisitor,
  cancelVisitor,
  getByTicket,
  getTodayVisitors,
  getAllVisitors,
  getReturningVisitors,
  getActivityLogs
};
