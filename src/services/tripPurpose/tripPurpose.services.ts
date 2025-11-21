import api from "../api/api";
import toastHelper from "../../utils/toastHelper";

export interface TripPurposeRequest {
  countryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TripPurpose {
  _id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TripPurposeResponse<T = TripPurpose[] | TripPurpose> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

const ENDPOINTS = [
  
  "/mobile/website/countries/trip-purposes",
];

export class TripPurposeService {
  static async list(
    payload: TripPurposeRequest = {}
  ): Promise<TripPurposeResponse> {
    let lastError: any = null;

    for (const endpoint of ENDPOINTS) {
      try {
        const response = await api.post(endpoint, payload);
        const ok =
          response.data?.success === true || response.data?.status === 200;
        if (!ok) {
          toastHelper.showTost(
            response.data?.message || "Failed to fetch trip purposes",
            "error"
          );
        }
        return response.data;
      } catch (error: any) {
        lastError = error;
        if (error?.response?.status !== 404) {
          break;
        }
      }
    }

    const message =
      lastError?.response?.data?.message ||
      "Failed to fetch trip purposes. Please check if the endpoint exists.";
    toastHelper.showTost(message, "error");
    throw lastError;
  }
}

export default TripPurposeService;

