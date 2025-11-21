import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface CountryDetailsResponse<T = any> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface CountryDetailsData {
  country: {
    _id: string;
    name: string;
    code: string;
    bannerImage: string;
    icon: string;
    description: string;
    displayOrder: number;
  };
  details: {
    _id: string;
    visaProcessingTime: string;
    visaFee: number;
    currency: string;
    additionalFees: number;
    processingType: string;
    validityPeriod: string;
    entryType: string;
    requirementsSummary: string;
  };
  tripPurposes: Array<{
    _id: string;
    name: string;
    code: string;
    description: string;
    checklistItemsCount: number;
  }>;
  faqs: Array<{
    _id: string;
    question: string;
    answer: string;
    category: string;
    appliesToAll: boolean;
  }>;
}

export class CountryDetailsService {
  static async getDetails(
    countryId: string
  ): Promise<CountryDetailsResponse<CountryDetailsData>> {
    try {
      // Try GET with countryId in URL path (most common REST pattern)
      const response = await api.get(
        `/mobile/website/countries/${countryId}`
      );
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to fetch country details',
          'error'
        );
      }
      return response.data;
    } catch (error: any) {
      // If GET fails with 404, try POST like the list endpoint
      if (error?.response?.status === 404) {
        try {
          const response = await api.post(
            `/mobile/website/countries/details`,
            { countryId }
          );
          const ok = response.data?.success === true || response.data?.status === 200;
          if (!ok) {
            toastHelper.showTost(
              response.data?.message || 'Failed to fetch country details',
              'error'
            );
          }
          return response.data;
        } catch (postError: any) {
          const message =
            postError?.response?.data?.message || 'Failed to fetch country details. Please check if the endpoint exists.';
          toastHelper.showTost(message, 'error');
          throw postError;
        }
      } else {
        const message =
          error?.response?.data?.message || 'Failed to fetch country details';
        toastHelper.showTost(message, 'error');
        throw error;
      }
    }
  }
}

export default CountryDetailsService;

