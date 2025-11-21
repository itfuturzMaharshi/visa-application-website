import api from "../api/api";
import toastHelper from "../../utils/toastHelper";

export interface CountryChecklistRequest {
  countryId?: string;
  countryCode?: string;
  tripPurposeId?: string;
  tripPurposeCode?: string;
}

export interface CountryChecklistItem {
  _id: string;
  title: string;
  description?: string;
  documentType?: string;
  fileFormat?: string;
  maxFileSize?: number;
  defaultIsMandatory?: boolean;
  isRequired?: boolean;
  customInstructions?: string;
}

export interface CountryChecklistData {
  country?: Record<string, unknown>;
  tripPurpose?: {
    _id: string;
    name: string;
    code: string;
    description?: string;
    icon?: string;
  };
  items: CountryChecklistItem[];
}

export interface CountryChecklistResponse<T = CountryChecklistData> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export class CountryChecklistService {
  static async getChecklist(
    payload: CountryChecklistRequest
  ): Promise<CountryChecklistResponse> {
    try {
      const response = await api.post(
        "/mobile/website/countries/checklist",
        payload
      );
      const ok =
        response.data?.success === true || response.data?.status === 200;
      if (!ok) {
        toastHelper.showTost(
          response.data?.message ||
            "Failed to fetch checklist for the selected purpose",
          "error"
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to fetch checklist for the selected purpose";
      toastHelper.showTost(message, "error");
      throw error;
    }
  }
}

export default CountryChecklistService;

