import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { AxiosResponse } from "axios";
import { ParsedData } from "./useUplaodAndGetCsvData";
import useAppBasedContext from "./useAppBasedContext";
export interface EditAndSaveResponse {
  message: string;
  invoice: Invoice;
}
export interface Invoice {
  invoiceId: string;
  customerId: number;
  calculationsByOrderType: {
    DELIVERY: OrderTypeDetails;
    COLLECTION: OrderTypeDetails;
    SERVICE_FEE?: OrderTypeDetails;
    DELIVERY_CHARGE?: OrderTypeDetails;
    DRIVER_TIP?: OrderTypeDetails;
    [key: string]: OrderTypeDetails | undefined; // For potential additional order types
  };
  calculationsByPaymentType: {
    CARD?: PaymentTypeDetails;
    [key: string]: PaymentTypeDetails | undefined; // For potential additional payment types
  };
  totalSubTotal: number;
  tax_amount: number;
  totalWithTax: number;
  totalSalesValue: number;
  amountToRecieve: number;
  startDate: string;
  endDate: string;
  storeName: string;
  _id: string;
  createdAt: string;
  __v: number;
  taxRate: number;
}

interface OrderTypeDetails {
  totalOrderValue: number;
  totalOrders: number;
  commissionRate: number;
  amount: number;
}

interface PaymentTypeDetails {
  totalOrderValue: number;
  totalOrders: number;
}

const saveEditedData = async (
  formValues: ParsedData
): Promise<AxiosResponse<EditAndSaveResponse, any>> => {
  return await ApiHelpers.POST(ApiConstants.SAVE_INVOICE_DATA(), formValues);
};

export const useSaveSubmittedData = () => {
  const { setTrackOldFormData } = useAppBasedContext();
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<EditAndSaveResponse>, Error, ParsedData>({
    mutationFn: (data: ParsedData) => saveEditedData(data),
    retry: 0,
    onSuccess: (data) => {
      notifications.show({
        title: data?.data?.message ?? "Data updated successfully",
        message: "Some more text here",
        color: "green",
      });
      setTrackOldFormData({ step2: data?.data });
    },
    onError: (data) =>
      notifications.show({
        title: "File Upload Failed",
        message: "Some more text here",
        color: "red",
      }),
  });
};
