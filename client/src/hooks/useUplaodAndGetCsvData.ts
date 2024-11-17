import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { FormValueTypes } from "../components/UploadandGenrateInvoice/Step1";
import { AxiosResponse } from "axios";
import useAppBasedContext from "./useAppBasedContext";
interface CalculationDetails {
    totalOrderValue: number;
    totalOrders: number;
    commissionRate: number;
    amount: number;
  }
  
  interface PaymentTypeDetails {
    totalOrderValue: number;
    totalOrders: number;
  }
  
  export interface CalculationsByOrderType {
    DELIVERY: CalculationDetails;
    COLLECTION: CalculationDetails;
    SERVICE_FEE: CalculationDetails;
    DELIVERY_CHARGE: CalculationDetails;
    DRIVER_TIP: CalculationDetails;
  }
  
  interface CalculationsByPaymentType {
    CARD: PaymentTypeDetails;
  }
  
 export  interface ParsedData {
    customerId: number;
    calculationsByOrderType: CalculationsByOrderType;
    calculationsByPaymentType: CalculationsByPaymentType;
    totalSubTotal: number;
    tax_amount: number;
    totalWithTax: number;
    totalSalesValue: number;
    amountToRecieve: number;
    startDate: string;
    endDate: string;
    storeName: string;
  }
  
const uploadFiles  = async (formValues:FormValueTypes):AxiosResponse<ParsedData> => {
  if (!formValues.csvfile || formValues.csvfile.length === 0) {
    throw new Error("No file");
    ;
  }
  const formData = new FormData();

  Array.from(formValues?.csvfile).forEach((file) => {
    formData.append("file", file);
  });
  formData.append('customerId',formValues.customerid);
  formData.append('taxRate', formValues.taxrate.toString());

  console.log(formData, "formdata");
  return await ApiHelpers.POST(ApiConstants.UPLOAD_AND_GET_INVOICE_DATA(), formData);
};

export const useUploadandGetCsvData = () => {
    const{setParsedData, setTrackOldFormData} = useAppBasedContext()
  return useMutation<AxiosResponse<ParsedData>, Error, FormValueTypes>({
    mutationFn: (data:FormValueTypes) => uploadFiles(data),
    retry: 0,
    onSuccess: (data,postedData) => {notifications.show({
        title:'File Uploaded successfully',
        message:'Some more text here',
        color:'green',
        autoClose:2000,
    });
    setParsedData(data?.data)
    setTrackOldFormData({step1:postedData})
},
    onError: (data) =>  notifications.show({
        title:'File Upload Failed',
        message: data?.message ?? 'Some more text here',
        color:'red',
        autoClose:5000,
    }),
  });
};
