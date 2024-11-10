import { createContext } from "react";

const AppBasedContextValues = {
  SomeKey: "check",
};
export const AppBasedContext = createContext(AppBasedContextValues);
