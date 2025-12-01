import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface UploadDocumentResponse<T = any> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface UploadDocumentRequest {
  checklistItemId: string;
  countryId?: string;
  countryCode?: string;
  tripPurposeId?: string;
  tripPurposeCode?: string;
  file: File;
}

export interface DocumentData {
  _id: string;
  user: string;
  checklistItem: string;
  documentType: string;
  fileUrl: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class UploadDocumentService {
  static async uploadDocument(
    data: UploadDocumentRequest
  ): Promise<UploadDocumentResponse<DocumentData>> {
    try {
      const formData = new FormData();
      formData.append('checklistItemId', data.checklistItemId);
      
      if (data.countryId) {
        formData.append('countryId', data.countryId);
      }
      if (data.countryCode) {
        formData.append('countryCode', data.countryCode);
      }
      if (data.tripPurposeId) {
        formData.append('tripPurposeId', data.tripPurposeId);
      }
      if (data.tripPurposeCode) {
        formData.append('tripPurposeCode', data.tripPurposeCode);
      }
      
      formData.append('file', data.file);

      const response = await api.post('/mobile/website/documents/upload', formData);
      const ok = response.data?.success === true || response.data?.status === 200;
      
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to upload document',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Document uploaded successfully',
          'success'
        );
      }
      
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to upload document. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }

  static async deleteDocument(
    documentId: string
  ): Promise<UploadDocumentResponse> {
    try {
      const response = await api.post('/mobile/website/documents/delete', {
        documentId,
      });
      const ok = response.data?.success === true || response.data?.status === 200;
      
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to delete document',
          'error'
        );
      } else {
        toastHelper.showTost(
          response.data?.message || 'Document deleted successfully',
          'success'
        );
      }
      
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to delete document. Please try again.';
      toastHelper.showTost(message, 'error');
      throw error;
    }
  }
}

export default UploadDocumentService;

