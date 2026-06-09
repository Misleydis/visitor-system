const { register } = require('./registerController');
const { login } = require('./loginController');
const { refresh, logout, logoutAll } = require('./sessionController');
const { forgotPassword, resetPassword } = require('./passwordController');

module.exports = { register, login, refresh, logout, logoutAll, forgotPassword, resetPassword };
