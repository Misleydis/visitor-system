import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user { id name email role }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) { msg }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($input: LogoutInput) {
    logout(input: $input) { msg }
  }
`;

export const LOGOUT_ALL = gql`
  mutation LogoutAll {
    logoutAll { msg }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) { msg }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) { msg }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users { _id name email role initials status }
  }
`;

export const GET_PENDING_USERS = gql`
  query GetPendingUsers {
    pendingUsers { _id name email role status }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user { id name email role initials }
    }
  }
`;

export const APPROVE_USER = gql`
  mutation ApproveUser($id: ID!, $input: ApproveUserInput!) {
    approveUser(id: $id, input: $input) { msg }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) { msg }
  }
`;

export const GET_VISITORS = gql`
  query GetVisitors {
    visitors {
      _id ticketNumber firstName surname nationalId phoneNumber address
      vehicleReg site personToVisit personToVisitOther purpose
      timeIn timeOut visitDate status cancelledAt
    }
  }
`;

export const GET_TODAY_VISITORS = gql`
  query GetTodayVisitors {
    todayVisitors {
      _id ticketNumber firstName surname nationalId phoneNumber address
      vehicleReg site personToVisit personToVisitOther purpose
      timeIn timeOut visitDate status cancelledAt
    }
  }
`;

export const GET_RETURNING_VISITORS = gql`
  query GetReturningVisitors {
    returningVisitors { nationalId count visits }
  }
`;

export const GET_VISITOR_BY_TICKET = gql`
  query GetVisitorByTicket($ticketNumber: String!) {
    visitorByTicket(ticketNumber: $ticketNumber) {
      _id ticketNumber firstName surname nationalId phoneNumber address
      vehicleReg site personToVisit personToVisitOther purpose
      timeIn timeOut visitDate status cancelledAt
    }
  }
`;

export const GET_ACTIVITY_LOGS = gql`
  query GetActivityLogs {
    activityLogs {
      _id userId userName userRole action targetType targetId details timestamp
    }
  }
`;

export const REGISTER_VISITOR = gql`
  mutation RegisterVisitor($input: RegisterVisitorInput!) {
    registerVisitor(input: $input) { visitor { _id ticketNumber firstName surname } msg }
  }
`;

export const UPDATE_VISITOR = gql`
  mutation UpdateVisitor($id: ID!, $input: UpdateVisitorInput!) {
    updateVisitor(id: $id, input: $input) { visitor { _id } msg }
  }
`;

export const DELETE_VISITOR = gql`
  mutation DeleteVisitor($id: ID!) {
    deleteVisitor(id: $id) { msg }
  }
`;

export const CLEAR_ALL_VISITORS = gql`
  mutation ClearAllVisitors {
    clearAllVisitors { msg }
  }
`;

export const TIMEOUT_VISITOR = gql`
  mutation TimeoutVisitor($id: ID!) {
    timeoutVisitor(id: $id) { visitor { _id status timeOut } msg }
  }
`;

export const CANCEL_VISITOR = gql`
  mutation CancelVisitor($id: ID!) {
    cancelVisitor(id: $id) { msg }
  }
`;

export const GET_NEXT_OB_ENTRY = gql`
  query GetNextObEntry($site: String!) {
    nextObEntryNumber(site: $site) { nextEntryNumber }
  }
`;

export const GET_MY_OB_ENTRIES = gql`
  query GetMyObEntries($filter: ObDateRangeInput) {
    myObEntries(filter: $filter) {
      _id date time entryNumber occurrence securityInitials site
      securityId { _id name initials }
      adminSignatures { adminInitials signedAt adminId { _id name initials } }
    }
  }
`;

export const GET_ALL_OB_ENTRIES = gql`
  query GetAllObEntries($filter: ObDateRangeInput) {
    allObEntries(filter: $filter) {
      _id date time entryNumber occurrence securityInitials site
      securityId { _id name initials }
      adminSignatures { adminInitials signedAt adminId { _id name initials } }
    }
  }
`;

export const GET_SECURITY_GUARDS = gql`
  query GetSecurityGuards {
    securityGuards { _id name email initials }
  }
`;

export const CREATE_OB_ENTRY = gql`
  mutation CreateObEntry($input: CreateObEntryInput!) {
    createObEntry(input: $input) {
      _id date time entryNumber occurrence site securityInitials
    }
  }
`;

export const SIGN_OFF_OB = gql`
  mutation SignOffOb($input: SignOffInput!) {
    signOffObEntries(input: $input) { msg entriesSigned }
  }
`;
