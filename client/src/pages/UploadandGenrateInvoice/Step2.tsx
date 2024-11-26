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
import { useEffect, useState } from "react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconTruckDelivery,
  IconCreditCardPay,
  IconInfoSquareRounded,
  IconCoinPound,
} from "@tabler/icons-react";
import {
  ParsedData,
  CalculationsByOrderType,
} from "../../hooks/useUplaodAndGetCsvData";
import useAppBasedContext from "../../hooks/useAppBasedContext";
import { modals } from "@mantine/modals";
import { DateTimePicker, DateValue } from "@mantine/dates";

const convertDate = (inputDateString: DateValue) => {
  const date = new Date(String(inputDateString));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}.0`;
};

type CalculationsByOrderTypeKeys = keyof CalculationsByOrderType;

const Labels: Record<CalculationsByOrderTypeKeys, string> = {
  DELIVERY_CHARGE: "Delivery Charge (Applicable)",
  DELIVERY: "Delivery Orders",
  COLLECTION: "Collection Orders",
  SERVICE_FEE: "Service Fee (Applicable)",
  DRIVER_TIP: "Driver Tip (Applicable)",
};

const AccordionConfig = [
  {
    label: "General Information",
    icon: (
      <IconInfoSquareRounded
        style={{
          color: "blue",
          width: rem(20),
          height: rem(20),
        }}
      />
    ),
    content: (formik) => (
      <>
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
          value={new Date(formik.values.startDate)}
          onChange={(value) =>
            formik.setFieldValue("startDate", convertDate(value))
          }
        />
        <DateTimePicker
          label="End Date"
          value={new Date(formik.values.endDate)}
          onChange={(value) =>
            formik.setFieldValue("endDate", convertDate(value))
          }
        />
      </>
    ),
  },
  {
    label: "Calculations by Order Type",
    icon: (
      <IconTruckDelivery
        style={{
          color: "#9b59b6",
          width: rem(20),
          height: rem(20),
        }}
      />
    ),
    content: (formik) => (
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
    ),
  },
  {
    label: "Calculations by Payment Type",
    icon: (
      <IconCreditCardPay
        style={{
          color: "#1abc9c",
          width: rem(20),
          height: rem(20),
        }}
      />
    ),
    content: (formik) => (
      <EditableTable
        data={formik.values?.calculationsByPaymentType}
        formik={formik}
        tableKey="calculationsByPaymentType"
        labels={Labels}
        columnsHeaders={["Type", "Total Sales Value", "Total Orders"]}
        isPayMentType
      />
    ),
  },
  {
    label: "Order Summary",
    icon: (
      <IconCoinPound
        style={{
          color: "#34495e",
          width: rem(20),
          height: rem(20),
        }}
      />
    ),
    content: (formik) => (
      <Stack>
        <Group mt="sm" wrap={"wrap"}>
          <NumberInput
            label="Sub-Total"
            value={formik.values.totalSubTotal}
            onChange={(value) =>
              formik.setFieldValue("totalSubTotal", Number(value))
            }
          />
          <NumberInput
            label="VAT (Amount)"
            value={formik.values.tax_amount}
            onChange={(value) =>
              formik.setFieldValue("tax_amount", Number(value))
            }
          />
          <NumberInput
            label="Total with Tax"
            value={formik.values.totalWithTax}
            onChange={(value) =>
              formik.setFieldValue("totalWithTax", Number(value))
            }
          />
          <NumberInput
            label="Total Sales Value"
            value={formik.values?.totalSalesValue}
            onChange={(value) =>
              formik.setFieldValue("totalSalesValue", Number(value))
            }
          />
        </Group>
        <Divider />
        <Text>Amount to Receive</Text>
        <Group mt="sm" wrap={"wrap"}>
          <NumberInput
            label="Cash Payment"
            value={formik.values?.amountToRecieve?.cashPayment}
            onChange={(value) =>
              formik.setFieldValue("amountToRecieve.cashPayment", Number(value))
            }
          />
          <NumberInput
            label="Bank Payment"
            value={formik.values?.amountToRecieve?.bankPayment}
            onChange={(value) =>
              formik.setFieldValue("amountToRecieve.bankPayment", Number(value))
            }
          />
          <NumberInput
            label="Total"
            value={formik.values?.amountToRecieve?.total}
            onChange={(value) =>
              formik.setFieldValue("amountToRecieve.total", Number(value))
            }
          />
        </Group>
      </Stack>
    ),
  },
];

const EditableTable = ({
  data,
  formik,
  tableKey,
  labels,
  columnsHeaders,
  isPayMentType,
}: {
  data: any;
  formik: any;
  tableKey: string;
  labels: Record<string, string>;
  columnsHeaders: string[];
  isPayMentType?: boolean;
}) => {
  return (
    <Table.ScrollContainer minWidth={'300px'} type="native">
    <Table striped highlightOnHover withColumnBorders >
      <thead>
        <tr>
          {columnsHeaders.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(formik.values?.[tableKey]).map((key) => {
          const calculation = formik.values?.[tableKey][key];
          return (
            <tr key={key}>
              <td>{key in labels ? labels[key] : key}</td>
              <td>
                <NumberInput
                  value={calculation.totalOrderValue}
                  onChange={(val) =>
                    formik.setFieldValue(
                      `${tableKey}.${key}.totalOrderValue`,
                      Number(val)
                    )
                  }
                  hideControls
                />
              </td>
              <td>
                <NumberInput
                  value={calculation.totalOrders}
                  onChange={(val) =>
                    formik.setFieldValue(
                      `${tableKey}.${key}.totalOrders`,
                      Number(val)
                    )
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
                          Number(val)
                        )
                      }
                      hideControls
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={calculation.amount}
                      onChange={(val) =>
                        formik.setFieldValue(
                          `${tableKey}.${key}.amount`,
                          Number(val)
                        )
                      }
                      hideControls
                    />
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
</Table.ScrollContainer>

  );
};

const InvoicePreview = ({ setActiveStep }: InvoicePreviewProps) => {
  const {
    mutateAsync: saveEditedData,
    isSuccess: isSuccessInUpdatingData,
    isPending,
  } = useSaveSubmittedData();
  const { trackOldFormData, parsedData: CalculatedData } = useAppBasedContext();

  const formik = useFormik<ParsedData>({
    initialValues: trackOldFormData?.step2  ?? CalculatedData,
    onSubmit: (values) => {
      modals.openConfirmModal({
        title: "Please confirm your action",
        children: (
          <Text size="sm">
            I have checked all the calculations, and I am ready to generate
            Invoice.
          </Text>
        ),
        labels: { confirm: "Confirm", cancel: "Cancel" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => saveEditedData(values),
      });
    },
  });

  useEffect(() => {
    if (isSuccessInUpdatingData) {
      setActiveStep((prev:number) => prev + 1);
    }
  }, [isSuccessInUpdatingData, setActiveStep]);

  const [accordianValue, setAccordianValue] = useState<string[]>([
    "Order Summary",
  ]);

  return (
    <Box mx="auto" mt="xl">
      <Accordion
        variant="contained"
        multiple
        value={accordianValue}
        onChange={setAccordianValue}
        transitionDuration={400}
      >
        {Object.keys(formik.values)?.length > 0 && (
          <form onSubmit={formik.handleSubmit}>
            {AccordionConfig.map(({ label, icon, content }) => (
              <Accordion.Item value={label} key={label}>
                <Accordion.Control icon={icon}>{label}</Accordion.Control>
                <Accordion.Panel>{content(formik)}</Accordion.Panel>
              </Accordion.Item>
            ))}
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
