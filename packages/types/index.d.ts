/**
 * TypeScript type definitions for Visitor System Backend
 */

// User types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'security' | 'reception' | 'admin' | 'pending';
  status: 'pending' | 'active';
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Refresh Token types
export interface IRefreshToken {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
  revokedAt?: Date;
  replacedByToken?: string;
}

// Token types
export interface IAccessTokenPayload {
  id: string;
  email: string;
  role: string;
  type: 'access';
  iat: number;
  exp: number;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Visitor types
export interface IVisitor {
  _id: string;
  name: string;
  phone: string;
  purpose: string;
  hostName: string;
  company?: string;
  ticketNumber: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'checked-in' | 'checked-out' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface IVisitorCreate {
  name: string;
  phone: string;
  purpose: string;
  hostName: string;
  company?: string;
}

export interface IVisitorUpdate {
  name?: string;
  phone?: string;
  purpose?: string;
  hostName?: string;
  company?: string;
  status?: 'checked-in' | 'checked-out' | 'cancelled';
}

// Activity Log types
export interface IActivityLog {
  _id: string;
  action: string;
  userId: string;
  visitorId?: string;
  details: any;
  timestamp: Date;
}

// Reset Code types
export interface IResetCode {
  _id: string;
  email: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
}

// Request/Response types
export interface IAuthRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface IApiResponse<T = any> {
  msg?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Express Request extension
declare global {
  namespace Express {
    interface Request {
      user?: IAccessTokenPayload;
      io?: any;
    }
  }
}
