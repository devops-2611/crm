import { useQuery } from "@tanstack/react-query";
import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";
import { AxiosResponse } from "axios";
interface ConfigDetails {
  serviceFee: {
    isApplicable: boolean;
    value: number;
  };
  deliveryCharge: {
    isApplicable: boolean;
    value: number;
  };
  driverTip: {
    isApplicable: boolean;
    value: number;
  };
}

export interface CustomerData {
  configDetails: ConfigDetails;
  _id: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  createdAt: string; // Use Date type if parsing into actual Date objects
  updatedAt: string; // Use Date type if parsing into actual Date objects
  __v: number;
}

function fetchCustomerConfig(id: string | null): Promise<AxiosResponse<CustomerData>> {
  return ApiHelpers.GET(ApiConstants.GET_CUSTOMER_CONFIG(id));
}

export const useGetCustomerConfigbyID = (id: string | null) => {
  return useQuery({
    queryKey: ["customerlist", id],
    queryFn: () => fetchCustomerConfig(id),
    refetchOnWindowFocus: false,
    enabled:!!id
  });
};
