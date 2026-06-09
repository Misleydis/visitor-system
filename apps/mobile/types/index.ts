/**
 * TypeScript type definitions for Visitor System Mobile App
 */

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'security' | 'reception' | 'admin' | 'pending';
}

// Token types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Visitor types
export interface Visitor {
  _id: string;
  name: string;
  phone: string;
  purpose: string;
  hostName: string;
  company?: string;
  ticketNumber: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked-in' | 'checked-out' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface VisitorCreate {
  name: string;
  phone: string;
  purpose: string;
  hostName: string;
  company?: string;
}

export interface VisitorUpdate {
  name?: string;
  phone?: string;
  purpose?: string;
  hostName?: string;
  company?: string;
  status?: 'checked-in' | 'checked-out' | 'cancelled';
}

// Activity Log types
export interface ActivityLog {
  _id: string;
  action: string;
  userId: string;
  visitorId?: string;
  details: any;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T = any> {
  msg?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { email: string; code: string };
  Security: undefined;
  Reception: undefined;
  Admin: undefined;
};
