import { useFormik } from "formik";
import {
  TextInput,
  Group,
  NumberInput,
  Button,
  Box,
  Title,
  Divider,
} from "@mantine/core";
import {
  CalculationsByOrderType,
  ParsedData,
} from "../../hooks/useUplaodAndGetCsvData";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveSubmittedData } from "../../hooks/useSaveSubmittedData";
import { useEffect } from "react";
import React from "react";

interface InvoicePreviewProps {
  // active:number,
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}
type CalculationsByOrderTypeKeys = keyof CalculationsByOrderType;

const Labels: Record<CalculationsByOrderTypeKeys, string> = {
  DELIVERY_CHARGE: "Delivery Charge (Applicable)",
  DELIVERY: "Delivery Orders",
  COLLECTION: "Collection Orders",
  SERVICE_FEE: " Service Fee (Applicable)",
  DRIVER_TIP: "Driver Tip (Applicable)",
};
const InvoicePreview = (props: InvoicePreviewProps) => {
  const { setActiveStep } = props;
  const { mutateAsync: SaveEditedData, isSuccess: isSuccessInUpdatingData } =
    useSaveSubmittedData();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (isSuccessInUpdatingData) {
      setActiveStep((prev) => prev + 1);
    }
  }, [isSuccessInUpdatingData, setActiveStep]);
  const CalculatedData: ParsedData | undefined = queryClient.getQueryData([
    "CalculatedData",
  ]);

  const formik = useFormik({
    initialValues: CalculatedData ?? {},
    onSubmit: (values) => {
      if (values) {
        SaveEditedData(values);
      }
    },
  });
  console.log(CalculatedData, "CalculatedData");
  return (
    <Box maw={800} mx="auto" mt="xl">
      {Object.keys(formik.values)?.length > 0 && (
        <form onSubmit={formik.handleSubmit}>
          <Title order={3}>General Information</Title>
          <Divider my="md" />
          <TextInput
            label="Customer ID"
            {...formik.getFieldProps("customerId")}
            type="number"
            mt="md"
            disabled={true}
          />
          <TextInput
            label="Store Name"
            {...formik.getFieldProps("storeName")}
            mt="md"
          />
          <TextInput
            label="Start Date"
            {...formik.getFieldProps("startDate")}
            mt="md"
          />
          <TextInput
            label="End Date"
            {...formik.getFieldProps("endDate")}
            mt="md"
          />

          <Title order={3} mt="lg">
            Calculations by Order Type
          </Title>
          <Divider my="md" />
          {Object.keys(formik.values?.calculationsByOrderType).map((key) => (
            <Box key={key} mt="md">
              <Title order={4}>
                {key in Labels
                  ? Labels[key as keyof CalculationsByOrderType]
                  : key}
              </Title>
              <Group grow mt="sm">
                <NumberInput
                  label="Total Sales Value"
                  value={formik.values?.calculationsByOrderType[
                    key
                  ].totalOrderValue?.toFixed(2)}
                  onChange={(val) =>
                    formik.setFieldValue(
                      `calculationsByOrderType.${key}.totalOrderValue`,
                      val
                    )
                  }
                />
                <NumberInput
                  label="Total Orders"
                  value={
                    formik.values?.calculationsByOrderType[key].totalOrders
                  }
                  onChange={(val) =>
                    formik.setFieldValue(
                      `calculationsByOrderType.${key}.totalOrders`,
                      val
                    )
                  }
                />
                <NumberInput
                  label="Commission Rate"
                  value={
                    formik.values?.calculationsByOrderType[key].commissionRate
                  }
                  onChange={(val) =>
                    formik.setFieldValue(
                      `calculationsByOrderType.${key}.commissionRate`,
                      val
                    )
                  }
                />
                <NumberInput
                  label="Amount"
                  value={formik.values?.calculationsByOrderType[
                    key
                  ].amount?.toFixed(2)}
                  onChange={(val) =>
                    formik.setFieldValue(
                      `calculationsByOrderType.${key}.amount`,
                      val
                    )
                  }
                />
              </Group>
            </Box>
          ))}

          <Title order={3} mt="lg">
            Calculations by Payment Type
          </Title>
          <Divider my="md" />
          {Object.keys(formik.values?.calculationsByPaymentType).map((key) => (
            <Box key={key} mt="md">
              <Title order={4}>{key}</Title>
              <Group grow mt="sm">
                <NumberInput
                  label="Total Sales Value"
                  value={
                    formik.values?.calculationsByPaymentType[key]
                      .totalOrderValue
                  }
                  onChange={(val) =>
                    formik.setFieldValue(
                      `calculationsByPaymentType.${key}.totalOrderValue`,
                      val
                    )
                  }
                />
                <NumberInput
                  label="Total Orders"
                  value={
                    formik.values?.calculationsByPaymentType[key].totalOrders
                  }
                  onChange={(val) =>
                    formik.setFieldValue(
                      `calculationsByPaymentType.${key}.totalOrders`,
                      val
                    )
                  }
                />
              </Group>
            </Box>
          ))}

          <Title order={3} mt="lg">
            Order Summary
          </Title>
          <Divider my="md" />
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

          <Button type="submit" mt="xl" fullWidth>
            Proceed to Generate Invoice
          </Button>
        </form>
      )}
    </Box>
  );
};

export default InvoicePreview;
