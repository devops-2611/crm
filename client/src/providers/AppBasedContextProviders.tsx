import { ReactNode, useMemo, useState } from "react";
import { AppBasedContext } from "./AppContexts";
import { CustomerData } from "../hooks/useGetCustomerConfigbyID";
interface AppBAsedProvidersProps {
  children: ReactNode;
}

export interface AppBasedContextVariables{
  customerConfig:CustomerData,
  setCustomerConfig:(customerConfig:CustomerData)=>void
}

const AppBasedContextProviders = ({ children }:AppBAsedProvidersProps) => {
  const [contextValue, setContextValue] = useState<AppBasedContextVariables |null>(null);
  const value = useMemo(
    () => ({
      customerConfig: contextValue?.customerConfig ?? {},
      setCustomerConfig: (customerConfig:CustomerData) => setContextValue((prev)=>({...prev, customerConfig:customerConfig })),
    }),
    [contextValue?.customerConfig]
  );
  return (
    <AppBasedContext.Provider value={value}>
      {children}
    </AppBasedContext.Provider>
  );
};

export default AppBasedContextProviders;
