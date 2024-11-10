import { useMemo, useState } from "react";
import { AppBasedContext } from "./AppContexts";
const AppBasedContextProviders = ({ children }) => {
  const [someVariable, setSomeVariable] = useState("xyz");
  const value = useMemo(
    () => ({
      variable: someVariable,
      setVariable: (text) => setSomeVariable(text),
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
