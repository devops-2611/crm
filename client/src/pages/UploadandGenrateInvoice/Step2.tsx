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
  Stack,
  Divider,
} from "@mantine/core";
import { useSaveSubmittedData } from "../../hooks/useSaveSubmittedData";
import React, { useEffect, useState } from "react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconTruckDelivery,
  IconCreditCardPay,
  IconInfoSquareRounded,
  IconCoinPound,
} from "@tabler/icons-react";
import { CalculationsByOrderType } from "../../hooks/useUplaodAndGetCsvData";
import useAppBasedContext from "../../hooks/useAppBasedContext";
import { modals } from "@mantine/modals";
import { DateTimePicker, DateValue } from "@mantine/dates";
interface InvoicePreviewProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}
const convertDate = (inputDateString: DateValue) => {
  const date = new Date(String(inputDateString));

  // Format the date to the desired output
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}.0`;
  return formattedDate;
};
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
  isPayMentType = false,
}: {
  data: any;
  formik: any;
  tableKey: string;
  labels: Record<string, string>;
  columnsHeaders: string[];
  isPayMentType?: boolean;
}) => {
  return (
    <Table striped highlightOnHover withColumnBorders>
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
                  value={calculation.totalOrderValue}
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
                      value={calculation.amount}
                      onChange={(val) =>
                        formik.setFieldValue(`${tableKey}.${key}.amount`, val)
                      }
                      hideControls
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const InvoicePreview = ({ setActiveStep }: InvoicePreviewProps) => {
  const {
    mutateAsync: saveEditedData,
    isSuccess: isSuccessInUpdatingData,
    isPending,
  } = useSaveSubmittedData();
  const { parsedData: CalculatedData } = useAppBasedContext();
console.log(CalculatedData,"CalculatedData")
  const formik = useFormik({
    initialValues: CalculatedData ?? {},
    onSubmit: (values) => {
      if (values) {
        modals.openConfirmModal({
          title: "Please confirm your action",
          children: (
            <Text size="sm">
              I have checked all the calculations, and I am ready to generate Invoice.
            </Text>
          ),
          labels: { confirm: "Confirm", cancel: "Cancel" },
          onCancel: () => console.log("Cancel"),
          onConfirm: () => saveEditedData(values),
        });
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
      <Accordion
        variant="contained"
        multiple={true}
        value={accordianValue}
        onChange={setAccordianValue}
        transitionDuration={400}
      >
        {Object.keys(formik.values)?.length > 0 && (
          <form onSubmit={formik.handleSubmit}>
            <Accordion.Item value="photos">
              <Accordion.Control
                icon={
                  <IconInfoSquareRounded
                    style={{
                      color: "blue",
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
                  name="startDate"
                  label="Start Date"
                  clearable
                  valueFormat="DD MMM YYYY hh:mm A"
                  placeholder="Pick date and time"
                  value={new Date(formik.values?.startDate)}
                  popoverProps={{ width: "target" }}
                  onChange={(value) =>
                    formik.setFieldValue("startDate", convertDate(value))
                  }
                />
                <DateTimePicker
                  label="End Date"
                  clearable
                  valueFormat="DD MMM YYYY hh:mm A"
                  placeholder="Pick date and time"
                  value={new Date(formik?.values?.endDate)}
                  key={"endDate"}
                  name={'endDate'}
                  popoverProps={{ width: "target" }}
                  onChange={(value) =>
                    formik.setFieldValue("endDate", convertDate(value))
                  }
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="Calculations by Order Type">
              <Accordion.Control
                icon={
                  <IconTruckDelivery
                    style={{
                      color: "#9b59b6",
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
                  <IconCreditCardPay
                    style={{
                      color: "#1abc9c",
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
                  <IconCoinPound
                    style={{
                      color: "#34495e",
                      width: rem(20),
                      height: rem(20),
                    }}
                  />
                }
              >
                Order Summary
              </Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Text>Some text</Text>
                  <Group mt="sm" wrap={"wrap"}>
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
                  </Group>
                  <Divider/>
                  <Text>Amount to Receive</Text>
                  <Group mt="sm" wrap={"wrap"}>
                    <NumberInput
                      label="Cash Payment"
                      {...formik.getFieldProps("amountToRecieve.cashPayment")}
                      decimalScale={2}
                      fixedDecimalScale
                    />
                    <NumberInput
                      label="Bank Payment"
                      {...formik.getFieldProps("amountToRecieve.bankPayment")}
                      decimalScale={2}
                      fixedDecimalScale
                    />
                    <NumberInput
                      label="Total"
                      {...formik.getFieldProps("amountToRecieve.total")}
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Group justify="center">
              <Button
                type="button"
                mt="xl"
                onClick={() => setActiveStep((prev: number) => prev - 1)}
                loading={isPending}
                leftSection={<IconChevronLeft />}
              >
                Go Back
              </Button>
              <Button
                type="submit"
                mt="xl"
                loading={isPending}
                rightSection={<IconChevronRight />}
              >
                Proceed to Generate Invoice
              </Button>
            </Group>
          </form>
        )}
      </Accordion>
    </Box>
  );
};

export default InvoicePreview;
