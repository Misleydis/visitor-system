const { getUsers, getPendingUsers } = require('./listUsersController');
const { createUser } = require('./createUserController');
const { approveUser } = require('./approveUserController');
const { deleteUser } = require('./deleteUserController');

module.exports = { getUsers, getPendingUsers, createUser, approveUser, deleteUser };
