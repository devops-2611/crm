import { ReactNode, useMemo, useState } from "react";
import { AppBasedContext } from "./AppContexts";
interface AppBAsedProvidersProps {
  children: ReactNode;
}

export interface AppBasedContextVariables{
  variable:string,
  setVariable:(variable:string)=>void
}
const AppBasedContextProviders = ({ children }:AppBAsedProvidersProps) => {
  const [someVariable, setSomeVariable] = useState("xyz");
  const value = useMemo(
    () => ({
      variable: someVariable,
      setVariable: (text:string) => setSomeVariable(text),
    }),
    [someVariable]
  );
  return (
    <AppBasedContext.Provider value={value}>
      {children}
    </AppBasedContext.Provider>
  );
};

export default AppBasedContextProviders;
