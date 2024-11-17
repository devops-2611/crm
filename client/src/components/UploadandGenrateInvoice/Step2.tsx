import { useFormik } from "formik";
import {
  TextInput,
  Group,
  NumberInput,
  Button,
  Box,
  Accordion,
  rem,
  Table,
  Text,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveSubmittedData } from "../../hooks/useSaveSubmittedData";
import { useEffect, useState } from "react";
import { DateTimePicker } from "@mantine/dates";
import { IconPhoto } from "@tabler/icons-react";
import {
  CalculationsByOrderType,
  ParsedData,
} from "../../hooks/useUplaodAndGetCsvData";

interface InvoicePreviewProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

type CalculationsByOrderTypeKeys = keyof CalculationsByOrderType;

const Labels: Record<CalculationsByOrderTypeKeys, string> = {
  DELIVERY_CHARGE: "Delivery Charge (Applicable)",
  DELIVERY: "Delivery Orders",
  COLLECTION: "Collection Orders",
  SERVICE_FEE: "Service Fee (Applicable)",
  DRIVER_TIP: "Driver Tip (Applicable)",
};

const EditableTable = ({
  data,
  formik,
  tableKey,
  labels,
  columnsHeaders,
  isPayMentType=false,
}: {
  data: any;
  formik: any;
  tableKey: string;
  labels: Record<string, string>;
  columnsHeaders: string[];
  isPayMentType?:boolean
}) => {
  return (
    <Table striped highlightOnHover withColumnBorders  >
      <thead>
        <tr>
          {columnsHeaders?.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(formik.values?.[tableKey]).map((key) => {
          const calculation = formik.values?.[tableKey][key];
          return (
            <tr key={key}>
              <td>
                <Text>{key in labels ? labels[key] : key}</Text>
              </td>
              <td>
                <NumberInput
                  value={calculation.totalOrderValue?.toFixed(2)}
                  onChange={(val) =>
                    formik.setFieldValue(
                      `${tableKey}.${key}.totalOrderValue`,
                      val
                    )
                  }
                  hideControls
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
              <td>
                <NumberInput
                  value={calculation.totalOrders}
                  onChange={(val) =>
                    formik.setFieldValue(`${tableKey}.${key}.totalOrders`, val)
                  }
                  hideControls
                />
              </td>
              {!isPayMentType && (
                <>
                <td>
                <NumberInput
                  value={calculation.commissionRate}
                  onChange={(val) =>
                    formik.setFieldValue(
                      `${tableKey}.${key}.commissionRate`,
                      val
                    )
                  }
                  hideControls
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td>
              <td>
                <NumberInput
                  value={calculation.amount?.toFixed(2)}
                  onChange={(val) =>
                    formik.setFieldValue(`${tableKey}.${key}.amount`, val)
                  }
                  hideControls
                  decimalScale={2}
                  fixedDecimalScale
                />
              </td></>)}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const InvoicePreview = ({ setActiveStep }: InvoicePreviewProps) => {
  const { mutateAsync: saveEditedData, isSuccess: isSuccessInUpdatingData } =
    useSaveSubmittedData();
  const queryClient = useQueryClient();

  const CalculatedData: ParsedData | undefined = queryClient.getQueryData([
    "CalculatedData",
  ]);
  const formik = useFormik({
    initialValues: CalculatedData ?? {},
    onSubmit: (values) => {
      if (values) {
        saveEditedData(values);
      }
    },
  });

  useEffect(() => {
    if (isSuccessInUpdatingData) {
      setActiveStep((prev) => prev + 1);
    }
  }, [isSuccessInUpdatingData, setActiveStep]);
  const [accordianValue, setAccordianValue] = useState<string[]>([]);
  return (
    <Box mx="auto" mt="xl">
      <Accordion variant="contained" multiple={true} value={accordianValue} onChange={setAccordianValue}>
        {Object.keys(formik.values)?.length > 0 && (
          <form onSubmit={formik.handleSubmit}>
            <Accordion.Item value="photos">
              <Accordion.Control
                icon={
                  <IconPhoto
                    style={{
                      color: "var(--mantine-color-red-6)",
                      width: rem(20),
                      height: rem(20),
                    }}
                  />
                }
              >
                General Information
              </Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  label="Customer ID"
                  {...formik.getFieldProps("customerId")}
                  type="number"
                  mt="md"
                  disabled
                />
                <TextInput
                  label="Store Name"
                  {...formik.getFieldProps("storeName")}
                  mt="md"
                />
                <DateTimePicker
                  label="Start Date"
                  clearable
                  valueFormat="DD MMM YYYY hh:mm A"
                  placeholder="Pick date and time"
                />
                <TextInput
                  label="End Date"
                  {...formik.getFieldProps("endDate")}
                  mt="md"
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="Calculations by Order Type">
              <Accordion.Control
                icon={
                  <IconPhoto
                    style={{
                      color: "var(--mantine-color-red-6)",
                      width: rem(20),
                      height: rem(20),
                    }}
                  />
                }
              >
                Calculations by Order Type
              </Accordion.Control>
              <Accordion.Panel>
                <EditableTable
                  data={formik.values?.calculationsByOrderType}
                  formik={formik}
                  tableKey="calculationsByOrderType"
                  labels={Labels}
                  columnsHeaders={[
                    "Order Type",
                    "Total Sales Value",
                    "Total Orders",
                    "Commission Rate",
                    "Amount",
                  ]}
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="Calculations by Payment Type">
              <Accordion.Control
                icon={
                  <IconPhoto
                    style={{
                      color: "var(--mantine-color-red-6)",
                      width: rem(20),
                      height: rem(20),
                    }}
                  />
                }
              >
                Calculations by Payment Type
              </Accordion.Control>
              <Accordion.Panel>
                <EditableTable
                  data={formik.values?.calculationsByPaymentType}
                  formik={formik}
                  tableKey="calculationsByPaymentType"
                  labels={Labels}
                  columnsHeaders={["Type", "Total Sales Value", "Total Orders"]}
                  isPayMentType={true}
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="Order Summary">
              <Accordion.Control
                icon={
                  <IconPhoto
                    style={{
                      color: "var(--mantine-color-red-6)",
                      width: rem(20),
                      height: rem(20),
                    }}
                  />
                }
              >
                Order Summary
              </Accordion.Control>
              <Accordion.Panel>
                <Group grow mt="sm">
                  <NumberInput
                    decimalScale={2}
                    fixedDecimalScale
                    label="Sub-Total"
                    {...formik.getFieldProps("totalSubTotal")}
                  />
                  <NumberInput
                    label="VAT (Amount)"
                    {...formik.getFieldProps("tax_amount")}
                    decimalScale={2}
                    fixedDecimalScale
                  />
                  <NumberInput
                    label="Total with Tax"
                    {...formik.getFieldProps("totalWithTax")}
                    decimalScale={2}
                    fixedDecimalScale
                  />
                  <NumberInput
                    label="Total Sales Value"
                    {...formik.getFieldProps("totalSalesValue")}
                    decimalScale={2}
                    fixedDecimalScale
                  />
                  <NumberInput
                    label="Amount to Receive"
                    {...formik.getFieldProps("amountToRecieve")}
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
            <Button type="submit" mt="xl" fullWidth>
              Proceed to Generate Invoice
            </Button>
          </form>
        )}
      </Accordion>
    </Box>
  );
};

export default InvoicePreview;
