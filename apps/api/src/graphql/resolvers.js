const GraphQLJSON = require('graphql-type-json');
const authController = require('../controllers/auth');
const userController = require('../controllers/users');
const visitorController = require('../controllers/visitors');
const obController = require('../controllers/occurrenceBook');
const { runController, buildReq } = require('../utils/controllerAdapter');
const { requireAuth, requireRoles } = require('./auth');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createUserSchema,
  approveUserSchema,
  registerVisitorSchema,
  updateVisitorSchema,
  createObEntrySchema,
  signOffSchema
} = require('../validators/schemas');

const parseInput = (schema, input) => schema.parse(input);

const mapReturningVisitors = (groups) =>
  groups.map((g) => ({
    nationalId: g._id,
    count: g.count,
    visits: g.visits
  }));

const toUserRef = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && value._id) {
    return {
      _id: value._id.toString(),
      name: value.name,
      initials: value.initials
    };
  }
  return { _id: value.toString() };
};

const toIsoString = (value) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
};

const resolvers = {
  JSON: GraphQLJSON,

  OccurrenceBookEntry: {
    securityId: (entry) => toUserRef(entry.securityId),
    date: (entry) => toIsoString(entry.date),
    adminSignatures: (entry) => entry.adminSignatures || []
  },

  AdminSignature: {
    adminId: (sig) => toUserRef(sig.adminId),
    signedAt: (sig) => toIsoString(sig.signedAt)
  },

  Query: {
    users: async (_, __, context) => {
      requireAuth(context);
      return runController(userController.getUsers, buildReq(context));
    },
    pendingUsers: async (_, __, context) => {
      requireAuth(context);
      return runController(userController.getPendingUsers, buildReq(context));
    },
    visitors: async (_, __, context) => {
      requireRoles(context, 'admin', 'security');
      return runController(visitorController.getAllVisitors, buildReq(context));
    },
    todayVisitors: async (_, __, context) => {
      requireRoles(context, 'admin', 'security', 'reception');
      return runController(visitorController.getTodayVisitors, buildReq(context));
    },
    returningVisitors: async (_, __, context) => {
      requireRoles(context, 'security', 'admin');
      const groups = await runController(visitorController.getReturningVisitors, buildReq(context));
      return mapReturningVisitors(groups);
    },
    visitorByTicket: async (_, { ticketNumber }, context) => {
      requireRoles(context, 'reception', 'admin', 'security');
      return runController(
        visitorController.getByTicket,
        buildReq(context, { params: { ticketNumber } })
      );
    },
    activityLogs: async (_, __, context) => {
      requireAuth(context);
      return runController(visitorController.getActivityLogs, buildReq(context));
    },
    nextObEntryNumber: async (_, { site }, context) => {
      requireAuth(context);
      return runController(
        obController.getNextEntry,
        buildReq(context, { params: { site } })
      );
    },
    myObEntries: async (_, { filter }, context) => {
      requireAuth(context);
      return runController(
        obController.getMyEntries,
        buildReq(context, { query: filter || {} })
      );
    },
    allObEntries: async (_, { filter }, context) => {
      requireAuth(context);
      return runController(
        obController.getAllEntries,
        buildReq(context, { query: filter || {} })
      );
    },
    securityGuards: async (_, __, context) => {
      requireAuth(context);
      return runController(obController.getSecurityGuards, buildReq(context));
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      parseInput(registerSchema, input);
      return runController(authController.register, buildReq({ user: null }, { body: input }));
    },
    login: async (_, { input }) => {
      parseInput(loginSchema, input);
      return runController(authController.login, buildReq({ user: null }, { body: input }));
    },
    refreshToken: async (_, { input }) => {
      parseInput(refreshTokenSchema, input);
      return runController(authController.refresh, buildReq({ user: null }, { body: input }));
    },
    logout: async (_, { input }) => {
      if (input) parseInput(logoutSchema, input);
      return runController(authController.logout, buildReq({ user: null }, { body: input || {} }));
    },
    logoutAll: async (_, __, context) => {
      return runController(authController.logoutAll, buildReq(context));
    },
    forgotPassword: async (_, { input }) => {
      parseInput(forgotPasswordSchema, input);
      return runController(authController.forgotPassword, buildReq({ user: null }, { body: input }));
    },
    resetPassword: async (_, { input }) => {
      parseInput(resetPasswordSchema, input);
      return runController(authController.resetPassword, buildReq({ user: null }, { body: input }));
    },
    createUser: async (_, { input }, context) => {
      requireAuth(context);
      parseInput(createUserSchema, input);
      return runController(userController.createUser, buildReq(context, { body: input }));
    },
    approveUser: async (_, { id, input }, context) => {
      requireAuth(context);
      parseInput(approveUserSchema, input);
      return runController(
        userController.approveUser,
        buildReq(context, { params: { id }, body: input })
      );
    },
    deleteUser: async (_, { id }, context) => {
      requireAuth(context);
      return runController(
        userController.deleteUser,
        buildReq(context, { params: { id } })
      );
    },
    registerVisitor: async (_, { input }, context) => {
      requireRoles(context, 'security');
      parseInput(registerVisitorSchema, input);
      return runController(visitorController.registerVisitor, buildReq(context, { body: input }));
    },
    updateVisitor: async (_, { id, input }, context) => {
      requireRoles(context, 'security');
      parseInput(updateVisitorSchema, input);
      return runController(
        visitorController.updateVisitor,
        buildReq(context, { params: { id }, body: input })
      );
    },
    deleteVisitor: async (_, { id }, context) => {
      requireRoles(context, 'security', 'admin');
      return runController(
        visitorController.deleteVisitor,
        buildReq(context, { params: { id } })
      );
    },
    timeoutVisitor: async (_, { id }, context) => {
      requireRoles(context, 'security', 'admin');
      return runController(
        visitorController.timeoutVisitor,
        buildReq(context, { params: { id } })
      );
    },
    cancelVisitor: async (_, { id }, context) => {
      requireRoles(context, 'security', 'admin');
      return runController(
        visitorController.cancelVisitor,
        buildReq(context, { params: { id } })
      );
    },
    createObEntry: async (_, { input }, context) => {
      requireAuth(context);
      parseInput(createObEntrySchema, input);
      return runController(obController.createEntry, buildReq(context, { body: input }));
    },
    signOffObEntries: async (_, { input }, context) => {
      requireAuth(context);
      parseInput(signOffSchema, input);
      return runController(obController.signOff, buildReq(context, { body: input }));
    }
  }
};

module.exports = resolvers;
