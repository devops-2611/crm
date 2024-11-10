import { useContext } from "react";
import { AppBasedContext } from "../providers/AppContexts";
const useAppBasedContext = () => {
  return useContext(AppBasedContext);
};

export default useAppBasedContext;
