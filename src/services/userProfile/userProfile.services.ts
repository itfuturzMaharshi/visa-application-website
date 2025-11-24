import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface UserProfileResponse<T = any> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface UserProfileData {
  _id: string;
  fullName: string;
  email: string;
  countryCode: string;
  mobile_number: string;
  date_of_birth?: string | Date;
  gender?: 'male' | 'female' | 'other';
  profilePic?: string;
  city?: string;
  company_name?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  passportInfo?: {
    passportNumber: string;
    nationality: string;
    issueDate?: string | Date;
    expiryDate?: string | Date;
    placeOfIssue: string;
    passportFrontImage?: string;
    passportBackImage?: string;
    passportFullCopy?: string;
  };
  isVerified: boolean;
  active: boolean;
  isSubscribed: boolean;
  isDeleted?: boolean;
  lastLogin?: string | Date;
  machineId?: string;
  fcm?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  countryCode?: string;
  mobile_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  profilePic?: string;
  city?: string;
  company_name?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface UpdatePassportRequest {
  passportNumber?: string;
  nationality?: string;
  issueDate?: string;
  expiryDate?: string;
  placeOfIssue?: string;
  passportFrontImage?: string;
  passportBackImage?: string;
  passportFullCopy?: string;
}

export class UserProfileService {
  static async getProfile(): Promise<UserProfileResponse<UserProfileData>> {
    try {
      const response = await api.post('/mobile/profile/get');
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to fetch profile',
          'error'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to fetch profile. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

  static async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UserProfileResponse<UserProfileData>> {
    try {
      const response = await api.post('/mobile/profile/update', data);
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to update profile',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Profile updated successfully',
          'success'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to update profile. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

  static async updateProfileWithFormData(
    formData: FormData
  ): Promise<UserProfileResponse<UserProfileData>> {
    try {
      const response = await api.post('/mobile/profile/update', formData);
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to update profile',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Profile updated successfully',
          'success'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to update profile. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

  static async updatePassport(
    data: UpdatePassportRequest
  ): Promise<UserProfileResponse<UserProfileData>> {
    try {
      const response = await api.post('/mobile/profile/passport/update', data);
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to update passport information',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Passport information updated successfully',
          'success'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to update passport information. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }
}

export default UserProfileService;

