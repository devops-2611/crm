import { FileUpload } from "../Dropzone";
import { Box, Button, Container, Flex, NumberInput } from "@mantine/core";
import { Select, Stack } from "@mantine/core";
import { useGetAllCustomerList } from "../../hooks/useGetAllCustomerList";
import { useEffect, useMemo } from "react";
import { Form, Formik } from "formik";
import { useUploadandGetCsvData } from "../../hooks/useUplaodAndGetCsvData";
import { FileWithPath } from "@mantine/dropzone";
import React from "react";
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
interface DemoPropTypes {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}
export default function Demo(props: DemoPropTypes) {
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
      setActiveStep((prev)=>prev+1);
    }
  }, [isSuccesinUploadingData, setActiveStep]);

  const handleSubmit = (values: FormValueTypes) => {
    try {
      SubmitFormDataAndCSV(values);
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
      >
        {(Formikprops) => (
          <Form onSubmit={Formikprops.handleSubmit}>
            <Stack
              bg="var(--mantine-color-body)"
              // align="stretch"
              justify="center"
              gap="md"
            >
              {/* <Text
              size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
            >
              Generate Your Client`s Invoice here
            </Text> */}
              <Select
                data={getCutomersOptions}
                value={Formikprops.values.customerid}
                onChange={(value) =>
                  Formikprops.setFieldValue("customerid", value)
                }
                label={"Select your customer"}
                checked={false}
                name={"customerid"}
              />
              <NumberInput
                label="Enter Tax Rate"
                placeholder="Percents"
                suffix="%"
                defaultValue={Formikprops.initialValues.taxrate}
                mt="md"
                name={"taxrate"}
                onChange={Formikprops.handleChange}
              />

              <FileUpload />
              {/* <Flex justify={"center"}> */}
                <Button
                  variant="filled"
                  disabled={
                    !Formikprops.values.customerid ||
                    !Formikprops.values.csvfile
                  }
                  type={"submit"}
                >
                  Next
                </Button>
              {/* </Flex> */}
            </Stack>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
