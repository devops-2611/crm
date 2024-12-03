import { FileUpload } from "../../components/Dropzone";
import {
  Button,
  LoadingOverlay,
  NumberInput,
  Paper,
  Select,
  Stack,
} from "@mantine/core";

import { useGetAllCustomerList } from "../../hooks/useGetAllCustomerList";
import React, { useEffect, useMemo, useRef } from "react";
import { Form, Formik, FormikProps } from "formik";
import { useUploadandGetCsvData } from "../../hooks/useUplaodAndGetCsvData";
import { FileWithPath } from "@mantine/dropzone";
import * as Yup from "yup";
import FetchandSaveCustomerConfig from "./FetchandSaveCustomerConfig";
import { useIsFetching } from "@tanstack/react-query";
import useAppBasedContext from "../../hooks/useAppBasedContext";
import ErrorDetails from "./UploadFIlesDataError";
import { useScrollIntoView } from "@mantine/hooks";
export interface FormValueTypes {
  customerid: string;
  taxrate: number;
  csvfile: FileWithPath[] | null;
}
const initalValues: FormValueTypes = {
  customerid: "",
  taxrate: 20,
  csvfile: null,
};
const validationSchema = Yup.object().shape({
  customerid: Yup.string().required("Customer is required"),
  taxrate: Yup.number()
    .min(0, "Tax rate must be at least 0%")
    .max(100, "Tax rate cannot exceed 100%")
    .required("Tax rate is required"),
  csvfile: Yup.array()
    .min(1, "A CSV file is required")
    .required("CSV file is required"),
});
interface DemoPropTypes {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}
export default function Demo(props: Readonly<DemoPropTypes>) {
  const { trackOldFormData } = useAppBasedContext();
  const FormikRef = useRef<FormikProps<FormValueTypes>>(null);
  const { setActiveStep } = props;
  const { data: customerList } = useGetAllCustomerList();
  const isFetchingCustomerList = useIsFetching({ queryKey: ["customerlist"] });
  const getCutomersOptions = useMemo(
    () =>
      customerList?.data?.map((item) => ({
        label: item.customerName,
        value: item.customerId.toString(),
      })) ?? [],
    [customerList],
  );
  const {
    mutateAsync: SubmitFormDataAndCSV,
    isSuccess: isSuccesinUploadingData,
    isPending,
    error: ErrorOnUploadingFiles,
  } = useUploadandGetCsvData();

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  useEffect(() => {
    scrollIntoView();
  }, [ErrorOnUploadingFiles]);
  useEffect(() => {
    if (isSuccesinUploadingData) {
      setActiveStep((prev) => prev + 1);
    }
  }, [isSuccesinUploadingData, setActiveStep]);

  const handleSubmit = async (values: FormValueTypes) => {
    try {
      await SubmitFormDataAndCSV(values);
    } catch (error) {
      console.log("error occured");
    }
  };
  return (
    <Paper p={20} pos={"relative"} shadow="sm">
      <Formik
        initialValues={trackOldFormData?.step1 ?? initalValues}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
        validationSchema={validationSchema}
        validateOnBlur={true}
        innerRef={FormikRef}
      >
        {(Formikprops) => (
          <>
            <Form onSubmit={Formikprops.handleSubmit}>
              <Stack bg="var(--mantine-color-body)" justify="center" gap="md">
                <Select
                  data={getCutomersOptions}
                  value={Formikprops.values.customerid}
                  onChange={(value) =>
                    Formikprops.setFieldValue("customerid", value)
                  }
                  onBlur={() => Formikprops.setFieldTouched("customerid", true)}
                  label={"Select your customer"}
                  checked={false}
                  name={"customerid"}
                  searchable={true}
                  error={
                    Formikprops.touched.customerid &&
                    Formikprops.errors?.customerid
                      ? Formikprops?.errors?.customerid
                      : undefined
                  }
                  nothingFoundMessage={"No options available"}
                />

                <NumberInput
                  label="Enter Tax Rate"
                  placeholder="Percents"
                  suffix="%"
                  value={Formikprops.values.taxrate}
                  mt="md"
                  name={"taxrate"}
                  allowNegative={false}
                  onChange={(val) => Formikprops.setFieldValue("taxrate", val)}
                  error={
                    Formikprops.touched.taxrate && Formikprops.errors?.taxrate
                  }
                  onBlur={() => Formikprops.setFieldTouched("taxrate", true)}
                />

                <FileUpload />
                <Button
                  variant="filled"
                  disabled={
                    !Formikprops.values.customerid ||
                    !Formikprops.values.csvfile ||
                    Boolean(isFetchingCustomerList)
                  }
                  type={"submit"}
                  loading={isPending}
                >
                  Next
                </Button>
                <FetchandSaveCustomerConfig />
              </Stack>
            </Form>
            <ErrorDetails
              errorData={ErrorOnUploadingFiles?.response?.data}
              ref={targetRef}
            />
          </>
        )}
      </Formik>
      <LoadingOverlay
        visible={isPending}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
    </Paper>
  );
}
