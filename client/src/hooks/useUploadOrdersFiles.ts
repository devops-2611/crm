import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: any; // Update this to reflect the API response structure
}

interface UploadPayload {
  csvfile: File[];
}

const uploadAndParseDocument = async (
  payload: UploadPayload
): Promise<AxiosResponse<UploadResponse, any>> => {
    console.log("reachiung here")
  const formData = new FormData();
  console.log(payload, "payoad")
  payload.csvfile.forEach((file) => {
    formData.append("files", file);
  });
  console.log()
  return await ApiHelpers.POST(
    ApiConstants.UPLOAD_AND_PARSE_DOCUMENT(),
    formData
  );
};

export const useUploadOrdersFiles = (): UseMutationResult<
  AxiosResponse<UploadResponse>,
  Error,
  UploadPayload
> => {
  return useMutation({ mutationFn: uploadAndParseDocument });
};
