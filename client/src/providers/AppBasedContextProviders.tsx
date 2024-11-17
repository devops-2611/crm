import { ReactNode, useMemo, useState } from "react";
import { AppBasedContext } from "./AppContexts";
import { CustomerData } from "../hooks/useGetCustomerConfigbyID";
import { ParsedData } from "../hooks/useUplaodAndGetCsvData";
import { FormValueTypes } from "../components/UploadandGenrateInvoice/Step1";
import { EditAndSaveResponse } from "../hooks/useSaveSubmittedData";
interface AppBAsedProvidersProps {
  children: ReactNode;
}
interface completeFormData{
step1?:FormValueTypes, step2?:EditAndSaveResponse
}
export interface AppBasedContextVariables{
  customerConfig:CustomerData,
  setCustomerConfig:(customerConfig:CustomerData)=>void
  parsedData:ParsedData,
  setParsedData:(parsedDataData:ParsedData)=>void
  setTrackOldFormData:((data:completeFormData)=>void)
  trackOldFormData:completeFormData,
}

const AppBasedContextProviders = ({ children }:AppBAsedProvidersProps) => {
  const [contextValue, setContextValue] = useState<AppBasedContextVariables |null>(null);
  const value = useMemo(
    () => ({
      customerConfig: contextValue?.customerConfig ?? {},
      setCustomerConfig: (customerConfig:CustomerData) => setContextValue((prev)=>({...prev, customerConfig:customerConfig })),
      parsedData:contextValue?.parsedData,
      setParsedData:(parsedDataData:ParsedData)=>setContextValue((prev)=>({...prev,parsedData:parsedDataData})),
      trackOldFormData:contextValue?.trackOldFormData ?? {},
      setTrackOldFormData:(data:Partial<completeFormData>)=>setContextValue((prev)=>({...prev, "trackOldFormData":{...prev?.trackOldFormData, ...data}}))
    }),
    [contextValue?.customerConfig,contextValue?.parsedData,contextValue?.trackOldFormData]
  );
  return (
    <AppBasedContext.Provider value={value}>
      {children}
    </AppBasedContext.Provider>
  );
};

export default AppBasedContextProviders;
