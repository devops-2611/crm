import { FileUpload } from "../../components/Dropzone";
import { Button, Container, NumberInput } from "@mantine/core";
import { Select, Stack } from "@mantine/core";
import { useGetAllCustomerList } from "../../hooks/useGetAllCustomerList";
import { useEffect, useMemo } from "react";
import { Form, Formik } from "formik";
import { useUploadandGetCsvData } from "../../hooks/useUplaodAndGetCsvData";
import { FileWithPath } from "@mantine/dropzone";
import React from "react";
import * as Yup from "yup";
import FetchandSaveCustomerConfig from "./FetchandSaveCustomerConfig";

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
  const { setActiveStep } = props;
  const { data: customerList } = useGetAllCustomerList();

  const getCutomersOptions = useMemo(
    () =>
      customerList?.data?.map((item) => ({
        label: item.customerName,
        value: item.customerId.toString(),
      })) ?? [],
    [customerList]
  );
  const {
    mutateAsync: SubmitFormDataAndCSV,
    isSuccess: isSuccesinUploadingData,
  } = useUploadandGetCsvData();

  useEffect(() => {
    if (isSuccesinUploadingData) {
      setActiveStep((prev) => prev + 1);
    }
  }, [isSuccesinUploadingData, setActiveStep]);

  const handleSubmit = async(values: FormValueTypes) => {
    try {
      await SubmitFormDataAndCSV(values);
    } catch (error) {
      console.log("error occured");
    }
  };
  return (
    <Container p={20}>
      <Formik
        initialValues={initalValues}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
        validationSchema={validationSchema}
        validateOnBlur={true}
      >
        {(Formikprops) => (
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
                  !Formikprops.values.customerid || !Formikprops.values.csvfile
                }
                type={"submit"}
              >
                Next
              </Button>
              <FetchandSaveCustomerConfig />
            </Stack>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
