import { useFormikContext } from "formik";
import { useEffect } from "react";
import { useGetCustomerConfigbyID } from "../../hooks/useGetCustomerConfigbyID";
import useAppBasedContext from "../../hooks/useAppBasedContext";
import { FormValueTypes } from "./Step1";
import { notifications } from "@mantine/notifications";

const FetchandSaveCustomerConfig = () => {
  const { values } = useFormikContext<FormValueTypes>();
  const { setCustomerConfig } = useAppBasedContext();
  const {
    data,
    isSuccess: isSuccessinFetchingCustomerConfig,
    error,
  } = useGetCustomerConfigbyID(values.customerid ?? "");

  useEffect(() => {
    if (isSuccessinFetchingCustomerConfig) {
      setCustomerConfig(data?.data);
    }
    if (error?.message) {
      notifications.show({
        title: "Failed to Fetch Customer Config",
        message: error.message,
        color: "red",
      });
    }
  }, [data, isSuccessinFetchingCustomerConfig, setCustomerConfig, error]);
  return null;
};

export default FetchandSaveCustomerConfig;
