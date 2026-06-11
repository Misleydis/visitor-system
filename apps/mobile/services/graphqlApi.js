import { gqlMutate, gqlRequest } from './graphqlClient';
import * as ops from './graphqlOperations';

export { API_BASE, GRAPHQL_URL, API_HOST } from './config';

// Auth
export const login = async (email, password) => {
  const data = await gqlMutate(ops.LOGIN, { input: { email, password } });
  return { data: data.login };
};

export const registerUser = async (name, email, password) => {
  const data = await gqlMutate(ops.REGISTER, { input: { name, email, password } });
  return { data: data.register };
};

export const refreshToken = async (refreshTokenValue) => {
  const data = await gqlMutate(ops.REFRESH_TOKEN, { input: { refreshToken: refreshTokenValue } });
  return { data: data.refreshToken };
};

export const logout = async (refreshTokenValue) => {
  const data = await gqlMutate(ops.LOGOUT, { input: { refreshToken: refreshTokenValue } });
  return { data: data.logout };
};

export const logoutAll = async () => {
  const data = await gqlMutate(ops.LOGOUT_ALL);
  return { data: data.logoutAll };
};

// Visitors
export const registerVisitor = async (input) => {
  const data = await gqlMutate(ops.REGISTER_VISITOR, { input });
  return { data: data.registerVisitor };
};

export const getVisitorByTicket = async (ticketNumber) => {
  const data = await gqlRequest(ops.GET_VISITOR_BY_TICKET, { ticketNumber });
  return { data: data.visitorByTicket };
};

export const recordTimeOut = async (id) => {
  const data = await gqlMutate(ops.TIMEOUT_VISITOR, { id });
  return { data: data.timeoutVisitor };
};

export const cancelVisitor = async (id) => {
  const data = await gqlMutate(ops.CANCEL_VISITOR, { id });
  return { data: data.cancelVisitor };
};

export const editVisitor = async (id, input) => {
  const data = await gqlMutate(ops.UPDATE_VISITOR, { id, input });
  return { data: data.updateVisitor };
};

export const getTodayVisitors = async () => {
  const data = await gqlRequest(ops.GET_TODAY_VISITORS);
  return { data: data.todayVisitors };
};

export const getAllVisitors = async () => {
  const data = await gqlRequest(ops.GET_VISITORS);
  return { data: data.visitors };
};

export const getReturningVisitors = async () => {
  const data = await gqlRequest(ops.GET_RETURNING_VISITORS);
  return { data: data.returningVisitors };
};

export const deleteVisitor = async (id) => {
  const data = await gqlMutate(ops.DELETE_VISITOR, { id });
  return { data: data.deleteVisitor };
};

export const clearAllVisitors = async () => {
  const data = await gqlMutate(ops.CLEAR_ALL_VISITORS);
  return { data: data.clearAllVisitors };
};

export const getActivityLogs = async () => {
  const data = await gqlRequest(ops.GET_ACTIVITY_LOGS);
  return { data: data.activityLogs };
};

// Users
export const getUsers = async () => {
  const data = await gqlRequest(ops.GET_USERS);
  return { data: data.users };
};

export const getPendingUsers = async () => {
  const data = await gqlRequest(ops.GET_PENDING_USERS);
  return { data: data.pendingUsers };
};

export const approveUser = async (id, role, initials) => {
  const data = await gqlMutate(ops.APPROVE_USER, { id, input: { role, initials } });
  return { data: data.approveUser };
};

export const createUser = async (input) => {
  const data = await gqlMutate(ops.CREATE_USER, { input });
  return { data: data.createUser };
};

export const deleteUser = async (id) => {
  const data = await gqlMutate(ops.DELETE_USER, { id });
  return { data: data.deleteUser };
};

// Occurrence Book
export const getNextEntryNumber = async (site) => {
  const data = await gqlRequest(ops.GET_NEXT_OB_ENTRY, { site });
  return { data: data.nextObEntryNumber };
};

export const createOBEntry = async (input) => {
  const data = await gqlMutate(ops.CREATE_OB_ENTRY, { input });
  return { data: data.createObEntry };
};

export const getMyOBEntries = async (startDate, endDate) => {
  const filter = startDate && endDate ? { startDate, endDate } : undefined;
  const data = await gqlRequest(ops.GET_MY_OB_ENTRIES, { filter });
  return { data: data.myObEntries };
};

export const getAllOBEntries = async (startDate, endDate, securityId, site) => {
  const filter = { startDate, endDate, securityId, site };
  const data = await gqlRequest(ops.GET_ALL_OB_ENTRIES, { filter });
  return { data: data.allObEntries };
};

export const signOffOBEntries = async (input) => {
  const data = await gqlMutate(ops.SIGN_OFF_OB, { input });
  return { data: data.signOffObEntries };
};

export const getSecurityGuards = async () => {
  const data = await gqlRequest(ops.GET_SECURITY_GUARDS);
  return { data: data.securityGuards };
};
