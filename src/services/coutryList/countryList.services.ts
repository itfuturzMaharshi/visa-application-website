import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface CountryListRequest {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CountryListResponse<T = any> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export class CountryListService {
  static async list(
    payload: CountryListRequest = {}
  ): Promise<CountryListResponse> {
    try {
      const response = await api.post(
        '/mobile/website/countries/list',
        payload
      );
      const ok = response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to fetch country list',
          'error'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to fetch country list';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }
}

export default CountryListService;

