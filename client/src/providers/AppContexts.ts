import { createContext } from "react";
import { AppBasedContextVariables } from "./AppBasedContextProviders";

const AppBasedContextValues:AppBasedContextVariables = {
  variable:'',
  setVariable:(texT:string)=>{}
}
export const AppBasedContext = createContext<AppBasedContextVariables>(AppBasedContextValues);
