import { FileUpload } from "../../components/Dropzone";
import {
  Button,
  Card,
  Container,
  NumberInput,
  Table,
  Title,
  Text,
} from "@mantine/core";
import { Select, Stack } from "@mantine/core";
import { useGetAllCustomerList } from "../../hooks/useGetAllCustomerList";
import { useEffect, useMemo, useRef } from "react";
import { Form, Formik, FormikProps } from "formik";
import {
  useUploadandGetCsvData,
  ValidationErrorResponse,
} from "../../hooks/useUplaodAndGetCsvData";
import { FileWithPath } from "@mantine/dropzone";
import React from "react";
import * as Yup from "yup";
import FetchandSaveCustomerConfig from "./FetchandSaveCustomerConfig";
import { useIsFetching } from "@tanstack/react-query";
import useAppBasedContext from "../../hooks/useAppBasedContext";
// const ErrorDetails = ({
//   errorData,
// }: {
//   errorData: ValidationErrorResponse | undefined;
// }) => {
//   if (!errorData) {
//     return null;
//   }
//   return (
//     <Container>
//       <Title order={2}>{errorData.error}</Title>
//       {errorData.details.map((fileData, index) => (
//         <Card
//           key={index}
//           shadow="sm"
//           padding="lg"
//           style={{ marginBottom: "20px" }}
//         >
//           <Text>File: {fileData.fileName}</Text>

//           {fileData.issues.length > 0 && (
//             <Table striped highlightOnHover cellSpacing={'xs'} bgcolor="red">
//               <thead>
//                 <tr>
//                   <th>Invalid Field</th>
//                   <th>Invalid Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {fileData.issues.map((issue, issueIndex) => (
//                   <tr key={issueIndex}>
//                     <td>{issue.invalidField}</td>
//                     <td>{issue.invalidValue}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </Card>
//       ))}
//     </Container>
//   );
// };
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
  const {trackOldFormData} = useAppBasedContext()
  
  const { setActiveStep } = props;
  const { data: customerList } = useGetAllCustomerList();
  const isFetchingCustomerList = useIsFetching({ queryKey: ["customerlist"] });
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
    isPending,
  } = useUploadandGetCsvData();
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
    <Container p={20}>
      <Formik
        initialValues={trackOldFormData?.step1 ?? initalValues}
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
        )}
      </Formik>
      {/* <ErrorDetails errorData={ErrorOnUploadingFiles?.response?.data} /> */}
    </Container>
  );
}
