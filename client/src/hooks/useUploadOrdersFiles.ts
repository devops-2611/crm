import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosResponse, AxiosError } from "axios";
import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";

export interface UploadOrderAxiosResponseError {
  error: string; // General error message
  errors: {
    fileName: string; // The name of the file where the error occurred
    Error: string; // Specific error message for the file
  }[];
  success: boolean; // Indicates if the operation was successful
}

interface UploadResponse {
  success: boolean;
  message: string;
  data?: any; // Update this to reflect the API response structure
}

interface UploadPayload {
  csvfile: File[];
}

const uploadAndParseDocument = async (
  payload: UploadPayload,
): Promise<AxiosResponse<UploadResponse>> => {
  const formData = new FormData();
  payload.csvfile.forEach((file) => {
    formData.append("files", file);
  });
  return await ApiHelpers.POST(
    ApiConstants.UPLOAD_AND_PARSE_DOCUMENT(),
    formData,
  );
};

export const useUploadOrdersFiles = (): UseMutationResult<
  AxiosResponse<UploadResponse>,
  AxiosError<UploadOrderAxiosResponseError>,
  UploadPayload
> => {
  return useMutation({
    mutationFn: uploadAndParseDocument,
    // onError: (error) => {
    //   if (axios.isAxiosError(error) && error.response?.data) {
    //     const responseError: UploadOrderAxiosResponseError = error.response.data;
    //     console.error("Error Message:", responseError.error);
    //     responseError.errors.forEach((err) => {
    //       console.error(`File: ${err.fileName}, Error: ${err.Error}`);
    //     });
    //   } else {
    //     console.error("Unexpected Error:", error.message);
    //   }
    // },
  });
};
