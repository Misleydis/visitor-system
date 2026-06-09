const typeDefs = `#graphql
  scalar JSON

  type User {
    id: ID
    _id: ID
    name: String
    email: String
    role: String
    initials: String
    status: String
  }

  type AuthUser {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    expiresIn: String!
    user: AuthUser!
  }

  type TokenPayload {
    accessToken: String!
    refreshToken: String!
    expiresIn: String!
  }

  type MessageResponse {
    msg: String!
  }

  type Visitor {
    _id: ID!
    ticketNumber: String
    firstName: String
    surname: String
    nationalId: String
    phoneNumber: String
    address: String
    vehicleReg: String
    site: String
    personToVisit: String
    personToVisitOther: String
    purpose: String
    timeIn: String
    timeOut: String
    visitDate: String
    status: String
    cancelledAt: String
  }

  type VisitorMutationResponse {
    visitor: Visitor
    msg: String
  }

  type ReturningVisitorGroup {
    nationalId: String!
    count: Int!
    visits: [JSON!]!
  }

  type ActivityLog {
    _id: ID!
    userId: String
    userName: String
    userRole: String
    action: String
    targetType: String
    targetId: String
    details: String
    timestamp: String
  }

  type UserRef {
    _id: ID
    name: String
    initials: String
  }

  type AdminSignature {
    adminId: UserRef
    adminInitials: String
    signedAt: String
  }

  type OccurrenceBookEntry {
    _id: ID!
    date: String
    time: String
    entryNumber: Int
    occurrence: String
    securityId: UserRef
    securityInitials: String
    site: String
    adminSignatures: [AdminSignature]
  }

  type NextEntryResponse {
    nextEntryNumber: Int!
  }

  type SignOffResponse {
    msg: String!
    entriesSigned: Int!
  }

  type CreateUserResponse {
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RefreshTokenInput {
    refreshToken: String!
  }

  input LogoutInput {
    refreshToken: String
  }

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    email: String!
    code: String!
    newPassword: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: String!
    initials: String
  }

  input ApproveUserInput {
    role: String!
    initials: String
  }

  input RegisterVisitorInput {
    firstName: String!
    surname: String!
    nationalId: String!
    phoneNumber: String!
    address: String!
    vehicleReg: String
    site: String!
    personToVisit: String!
    personToVisitOther: String
    purpose: String!
  }

  input UpdateVisitorInput {
    firstName: String
    surname: String
    nationalId: String
    phoneNumber: String
    address: String
    vehicleReg: String
    site: String
    personToVisit: String
    personToVisitOther: String
    purpose: String
  }

  input CreateObEntryInput {
    date: String!
    time: String!
    entryNumber: String!
    occurrence: String!
    site: String!
    initials: String
  }

  input SignOffInput {
    securityId: ID!
    date: String!
    initials: String!
  }

  input ObDateRangeInput {
    startDate: String
    endDate: String
    securityId: ID
    site: String
  }

  type Query {
    """GET /api/users"""
    users: [User!]!
    """GET /api/users/pending"""
    pendingUsers: [User!]!
    """GET /api/visitors"""
    visitors: [Visitor!]!
    """GET /api/visitors/today"""
    todayVisitors: [Visitor!]!
    """GET /api/visitors/returning"""
    returningVisitors: [ReturningVisitorGroup!]!
    """GET /api/visitors/ticket/:ticketNumber"""
    visitorByTicket(ticketNumber: String!): Visitor!
    """GET /api/visitors/logs"""
    activityLogs: [ActivityLog!]!
    """GET /api/occurrence-book/next-entry/:site"""
    nextObEntryNumber(site: String!): NextEntryResponse!
    """GET /api/occurrence-book/my-entries"""
    myObEntries(filter: ObDateRangeInput): [OccurrenceBookEntry!]!
    """GET /api/occurrence-book/all"""
    allObEntries(filter: ObDateRangeInput): [OccurrenceBookEntry!]!
    """GET /api/occurrence-book/security-guards"""
    securityGuards: [User!]!
  }

  type Mutation {
    """POST /api/auth/register"""
    register(input: RegisterInput!): MessageResponse!
    """POST /api/auth/login"""
    login(input: LoginInput!): AuthPayload!
    """POST /api/auth/refresh"""
    refreshToken(input: RefreshTokenInput!): TokenPayload!
    """POST /api/auth/logout"""
    logout(input: LogoutInput): MessageResponse!
    """POST /api/auth/logout-all"""
    logoutAll: MessageResponse!
    """POST /api/auth/forgot-password"""
    forgotPassword(input: ForgotPasswordInput!): MessageResponse!
    """POST /api/auth/reset-password"""
    resetPassword(input: ResetPasswordInput!): MessageResponse!
    """POST /api/users"""
    createUser(input: CreateUserInput!): CreateUserResponse!
    """PUT /api/users/approve/:id"""
    approveUser(id: ID!, input: ApproveUserInput!): MessageResponse!
    """DELETE /api/users/:id"""
    deleteUser(id: ID!): MessageResponse!
    """POST /api/visitors"""
    registerVisitor(input: RegisterVisitorInput!): VisitorMutationResponse!
    """PUT /api/visitors/:id"""
    updateVisitor(id: ID!, input: UpdateVisitorInput!): VisitorMutationResponse!
    """DELETE /api/visitors/:id"""
    deleteVisitor(id: ID!): MessageResponse!
    """PUT /api/visitors/:id/timeout"""
    timeoutVisitor(id: ID!): VisitorMutationResponse!
    """PUT /api/visitors/:id/cancel"""
    cancelVisitor(id: ID!): MessageResponse!
    """POST /api/occurrence-book"""
    createObEntry(input: CreateObEntryInput!): OccurrenceBookEntry!
    """POST /api/occurrence-book/sign-off"""
    signOffObEntries(input: SignOffInput!): SignOffResponse!
  }
`;

module.exports = typeDefs;
