import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface AuthResponse<T = any> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  mobile_number: string;
  countryCode: string;
  profilePic?: string;
  machineId?: string;
  fcm?: string;
}

export interface RegisterResponse {
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile_number: string;
    countryCode: string;
    profilePic: string;
    isVerified: boolean;
  };
  requiresOtp: boolean;
}

export interface LoginRequest {
  mobile_number: string;
  countryCode?: string;
  machineId?: string;
  fcm?: string;
}

export interface LoginResponse {
  requiresOtp: boolean;
}

export interface VerifyOtpRequest {
  mobile_number: string;
  otp: string;
  machineId?: string;
  fcm?: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile_number: string;
    countryCode: string;
    profilePic: string;
    isVerified: boolean;
  };
}

export interface ResendOtpRequest {
  mobile_number: string;
  countryCode?: string;
}

export class AuthService {
  static async register(
    data: RegisterRequest
  ): Promise<AuthResponse<RegisterResponse>> {
    try {
      const response = await api.post('/mobile/auth/register', data);
      // SweetAlert2 handles notifications in the component
      return response.data;
    } catch (error: any) {
      // SweetAlert2 handles error notifications in the component
      throw error;
    }
  }

  static async login(
    data: LoginRequest
  ): Promise<AuthResponse<LoginResponse>> {
    try {
      const response = await api.post('/mobile/auth/login', data);
      // SweetAlert2 handles notifications in the component
      return response.data;
    } catch (error: any) {
      // SweetAlert2 handles error notifications in the component
      throw error;
    }
  }

  static async verifyOtp(
    data: VerifyOtpRequest
  ): Promise<AuthResponse<VerifyOtpResponse>> {
    try {
      const response = await api.post('/mobile/auth/verify-otp', data);
      // SweetAlert2 handles notifications in the component
      return response.data;
    } catch (error: any) {
      // SweetAlert2 handles error notifications in the component
      throw error;
    }
  }

  static async resendOtp(
    data: ResendOtpRequest
  ): Promise<AuthResponse> {
    try {
      const response = await api.post('/mobile/auth/resend-otp', data);
      // SweetAlert2 handles notifications in the component
      return response.data;
    } catch (error: any) {
      // SweetAlert2 handles error notifications in the component
      throw error;
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      const response = await api.post('/mobile/auth/logout');
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Logout failed',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Logged out successfully',
          'success'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Logout failed. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }
}

export default AuthService;

