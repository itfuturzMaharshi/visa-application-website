import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface AdminNote {
  _id: string;
  note: string;
  createdBy: string;
  createdAt: string | Date;
}

export interface ApplicationListItem {
  _id: string;
  applicationId: string;
  status: 'draft' | 'submitted' | 'payment_pending' | 'under_review' | 'additional_docs_required' | 'approved' | 'rejected' | 'cancelled';
  country: {
    _id: string;
    name: string;
    code: string;
    bannerImage?: string;
    icon?: string;
  };
  tripPurpose: {
    _id: string;
    name: string;
    code: string;
  };
  submittedAt?: string | Date;
  adminNotes?: AdminNote[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApplicationsListRequest {
  page?: number;
  limit?: number;
  status?: string;
}

export interface PaginationInfo {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ApplicationsListData {
  docs: ApplicationListItem[];
  pagination: PaginationInfo;
}

export interface ApplicationsListResponse<T = ApplicationsListData> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export class VisaApplyListService {
  /**
   * Fetch list of visa applications
   */
  static async getApplicationsList(
    payload: ApplicationsListRequest = {}
  ): Promise<ApplicationsListResponse> {
    try {
      const response = await api.post(
        '/mobile/website/applications/list',
        payload
      );
      const ok =
        response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to fetch applications list',
          'error'
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to fetch applications list. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }
}

export default VisaApplyListService;

