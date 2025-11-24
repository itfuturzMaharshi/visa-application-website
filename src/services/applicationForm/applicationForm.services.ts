import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface ApplicationConfigRequest {
  countryId?: string;
  countryCode?: string;
  tripPurposeId?: string;
  tripPurposeCode?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'email' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file';
  options?: FormFieldOption[];
  isRequired: boolean;
  validation?: Record<string, unknown>;
  placeholder?: string;
  helpText?: string;
  displayOrder: number;
}

export interface FormSection {
  sectionName: string;
  sectionOrder: number;
  fields: FormField[];
}

export interface FormConfig {
  sections: FormSection[];
}

export interface ApplicationConfigData {
  country?: Record<string, unknown>;
  tripPurpose?: Record<string, unknown>;
  formConfig: FormConfig;
  checklistItems?: unknown[];
}

export interface ApplicationConfigResponse<T = ApplicationConfigData> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ApplicationSubmitRequest {
  countryId?: string;
  countryCode?: string;
  tripPurposeId?: string;
  tripPurposeCode?: string;
  formData: Record<string, unknown>;
}

export interface ApplicationSubmitResponse<T = unknown> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export class ApplicationFormService {
  /**
   * Fetch application form configuration
   */
  static async getApplicationConfig(
    payload: ApplicationConfigRequest
  ): Promise<ApplicationConfigResponse> {
    try {
      const response = await api.post(
        '/mobile/website/countries/application-config',
        payload
      );
      const ok =
        response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message ||
            'Failed to fetch application form configuration',
          'error'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to fetch application form configuration';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

  /**
   * Submit application form
   */
  static async submitApplication(
    payload: ApplicationSubmitRequest
  ): Promise<ApplicationSubmitResponse> {
    try {
      const response = await api.post(
        '/mobile/website/applications/submit',
        payload
      );
      const ok =
        response.data?.success === true || response.data?.status === 200;
      
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to submit application',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Application submitted successfully',
          'success'
        );
      }
      
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to submit application. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

  /**
   * Submit application form with FormData (for file uploads)
   */
  static async submitApplicationWithFormData(
    formData: FormData
  ): Promise<ApplicationSubmitResponse> {
    try {
      const response = await api.post(
        '/mobile/website/applications/submit',
        formData
      );
      const ok =
        response.data?.success === true || response.data?.status === 200;
      
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to submit application',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Application submitted successfully',
          'success'
        );
      }
      
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to submit application. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

}

export default ApplicationFormService;

