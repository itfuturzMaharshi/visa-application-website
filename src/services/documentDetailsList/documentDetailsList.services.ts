import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface DocumentItem {
  _id: string;
  fileUrl: string;
  documentType: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string | Date;
  rejectionReason?: string;
  checklistItem?: {
    _id: string;
    title: string;
    documentType: string;
    isMandatory: boolean;
    fileFormat?: string;
    maxFileSize?: number;
  };
  verifiedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
}

export interface PaymentInfo {
  _id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  gatewayTransactionId?: string;
  paidAt?: string | Date;
  refundAmount?: number;
  refundReason?: string;
  country?: {
    _id: string;
    name: string;
    code: string;
  };
  tripPurpose?: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface AdminNote {
  note: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
}

export interface StatusHistoryItem {
  status: string;
  changedAt: string | Date;
  changedBy: string;
  note?: string;
}

export interface ApplicationDetailsData {
  applicationId: string;
  status: 'draft' | 'submitted' | 'payment_pending' | 'under_review' | 'additional_docs_required' | 'approved' | 'rejected' | 'cancelled';
  formData: Record<string, unknown>;
  country: {
    _id: string;
    name: string;
    code: string;
    bannerImage?: string;
    icon?: string;
    description?: string;
  };
  tripPurpose: {
    _id: string;
    name: string;
    code: string;
    description?: string;
  };
  submittedAt?: string | Date;
  processedAt?: string | Date;
  estimatedProcessingDate?: string | Date;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  adminNotes: AdminNote[];
  statusHistory: StatusHistoryItem[];
  documents: DocumentItem[];
  payment: PaymentInfo | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApplicationDetailsRequest {
  applicationId: string;
}

export interface ApplicationDetailsResponse<T = ApplicationDetailsData> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export class DocumentDetailsListService {
  /**
   * Fetch application details with documents
   */
  static async getApplicationDetails(
    payload: ApplicationDetailsRequest
  ): Promise<ApplicationDetailsResponse> {
    try {
      console.log('Calling DocumentDetails API with payload:', payload);
      const response = await api.post(
        '/mobile/website/applications/details',
        payload
      );
      
      console.log('DocumentDetails API raw response:', response);
      console.log('DocumentDetails API response.data:', response.data);
      
      const ok =
        response.data?.success === true || response.data?.status === 200;
      
      if (!ok) {
        const errorMessage = response.data?.message || 'Failed to fetch application details';
        console.warn('DocumentDetails API returned non-success:', errorMessage);
        toastHelper.showTost(errorMessage, 'error');
      } else {
        console.log('DocumentDetails API success, returning data');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('DocumentDetails API error:', error);
      console.error('Error response:', error?.response);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch application details. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }
}

export default DocumentDetailsListService;

