import api from '../api/api';
import toastHelper from '../../utils/toastHelper';

export interface ExtractedPassportData {
  passport_number?: string;
  name?: string;
  full_name?: string;
  dob?: string;
  date_of_birth?: string;
  sex?: string;
  gender?: string;
  nationality?: string;
  date_of_issue?: string;
  passportIssueDate?: string;
  date_of_expiry?: string;
  passportExpiryDate?: string;
  place_of_issue?: string;
  passportIssuePlace?: string;
  place_of_birth?: string;
  passportPinCode?: string;
  pin_code?: string;
  father_name?: string;
  passportFatherName?: string;
  mother_name?: string;
  passportMotherName?: string;
  spouse_name?: string;
  spouseName?: string;
  address?: string;
  file_number?: string;
  old_passport_number?: string;
  oldPassportNumber?: string;
  old_passport_issue_date?: string;
  oldPassportIssueDate?: string;
  old_passport_issue_place?: string;
  oldPassportIssuePlace?: string;
  raw_text?: string;
}

export interface ExtractedPanData {
  pan_number?: string;
  panNumber?: string;
  name?: string;
  panName?: string;
  dob?: string;
  panDob?: string;
  father_name?: string;
  panFatherName?: string;
  raw_text?: string;
}

export interface ExtractedData {
  passport?: ExtractedPassportData;
  pan?: ExtractedPanData;
}

export interface DocumentExtractionResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: {
    documents?: unknown[];
    extracted_data?: ExtractedData;
    passport_urls?: string[];
    pan_url?: string;
  };
}

export class DocumentExtractionService {
  /**
   * Get user documents and extract data using AI
   * Note: This API may take 30-60 seconds due to AI processing
   */
  static async getUserDocumentsAndExtract(): Promise<DocumentExtractionResponse> {
    try {
      // No timeout - let the API take as long as it needs for AI processing
      const response = await api.post('/mobile/website/documents/extract', {}, {
        timeout: 0, // No timeout - wait indefinitely for AI processing
      });
      const ok = response.data?.success === true || response.data?.status === 200;
      
      if (!ok) {
        toastHelper.showTost(
          response.data?.message || 'Failed to extract document data',
          'error'
        );
      }
      // Don't show success toast here - it's already handled in the modal
      
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to extract document data. Please try again.';
      // Don't show error toast here - it's handled in the modal with better UX
      throw error;
    }
  }
}

export default DocumentExtractionService;

