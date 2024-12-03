import { ReactNode, useMemo, useState } from "react";
import { AppBasedContext } from "./AppContexts";
import { CustomerData } from "../hooks/useGetCustomerConfigbyID";
import { ParsedData } from "../hooks/useUplaodAndGetCsvData";
import { FormValueTypes } from "../pages/UploadandGenrateInvoice/Step1";
import { EditAndSaveResponse } from "../hooks/useSaveSubmittedData";
interface AppBAsedProvidersProps {
  children: ReactNode;
}
interface completeFormData {
  step1?: FormValueTypes;
  step2?: ParsedData;
}
const initialAppBasedContextValues: AppBasedContextVariables = {
  customerConfig: undefined, // CustomerData is undefined initially
  setCustomerConfig: (customerConfig: CustomerData) => {}, // Placeholder function
  parsedData: undefined, // ParsedData is undefined initially
  setParsedData: (parsedDataData: ParsedData | undefined) => {}, // Placeholder function
  InvoiceData: undefined, // EditAndSaveResponse is undefined initially
  setInvoiceData: (invoiceData: EditAndSaveResponse | undefined) => {}, // Placeholder function
  setTrackOldFormData: (data: completeFormData | undefined) => {}, // Placeholder function
  trackOldFormData: undefined, // completeFormData is undefined initially
};
export interface AppBasedContextVariables {
  customerConfig?: CustomerData | undefined;
  setCustomerConfig: (customerConfig: CustomerData) => void;
  parsedData: ParsedData | undefined;
  setParsedData: (parsedDataData: ParsedData | undefined) => void;
  InvoiceData: EditAndSaveResponse | undefined;
  setInvoiceData: (invoiceData: EditAndSaveResponse | undefined) => void;
  setTrackOldFormData: (data: completeFormData | undefined) => void;
  trackOldFormData: completeFormData | undefined;
}
const AppBasedContextProviders = ({ children }: AppBAsedProvidersProps) => {
  const [contextValue, setContextValue] = useState<AppBasedContextVariables>(
    initialAppBasedContextValues,
  );

  const value = useMemo(
    () => ({
      customerConfig: contextValue?.customerConfig,
      setCustomerConfig: (customerConfig: CustomerData) =>
        setContextValue((prev) => ({
          ...prev,
          customerConfig: customerConfig,
        })),
      parsedData: contextValue?.parsedData ?? undefined,
      setParsedData: (parsedDataData: ParsedData | undefined) =>
        setContextValue((prev) => ({ ...prev, parsedData: parsedDataData })),
      trackOldFormData: contextValue?.trackOldFormData,
      setTrackOldFormData: (data: Partial<completeFormData> | undefined) =>
        setContextValue((prev) => ({
          ...prev,
          trackOldFormData: { ...prev?.trackOldFormData, ...data },
        })),
      InvoiceData: contextValue?.InvoiceData,
      setInvoiceData: (invoiceData: EditAndSaveResponse | undefined) =>
        setContextValue((prev) => ({ ...prev, InvoiceData: invoiceData })),
    }),
    [
      contextValue?.customerConfig,
      contextValue?.parsedData,
      contextValue?.trackOldFormData,
      contextValue?.InvoiceData,
    ],
  );

  return (
    <AppBasedContext.Provider value={value}>
      {children}
    </AppBasedContext.Provider>
  );
};

export default AppBasedContextProviders;
