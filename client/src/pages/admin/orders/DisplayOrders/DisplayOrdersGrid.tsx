import { useMemo, useState } from "react";
import AppGridRemoteDataFetching from "../../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching";
import { Order, useGETALLOrdersWithFilters } from "./useGetAllOrders";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import { useDisclosure } from "@mantine/hooks";
import MUIThemeProvider from "../../../../providers/MUIThemeProvider";
import dayjs from "dayjs";
import AppChipComponent from "../../../../components/AppChipComponent";
import TextWithIcon from "../../../../components/TextWithIcon";
const DisplayOrdersGrid = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const {
    data: OrdersDataApiResponse,
    isError,
    isLoading,
  } = useGETALLOrdersWithFilters({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "merchantId",
        header: "Merchant ID",
        enableSorting: false,
        enableEditing: false,
      },
      {
        accessorKey: "orderId",
        header: "Order ID",
        enableColumnFilter: false,
        enableSorting: false,
        maxSize: 40,
        enableEditing: false,
      },
      {
        accessorKey: "orderDate",
        accessorFn: (originalRow) => new Date(originalRow.orderDate),
        header: "Order Date",
        filterVariant: "date-range",
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return dayjs(date).format("MM-DD-YYYY");
        },
        muiFilterDatePickerProps: {
          label: "Order Date",
        },
        maxSize: 50,
      },
      {
        accessorKey: "customerId",
        header: "Customer ID",
        enableSorting: false,
        maxSize: 30,
        enableEditing: false,
      },
      {
        accessorKey: "customerFirstName",
        header: "Customer First Name",
        enableColumnFilter: false,
      },
      {
        accessorKey: "customerLastName",
        header: "Customer Last Name",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "orderType",
        header: "Order Type",
        filterVariant: "multi-select", // Multi-select filter
        filterSelectOptions: [
          { label: "DELIVERY", value: "DELIVERY" },
          { label: "COLLECTION", value: "COLLECTION" },
        ], // Example filter options
        enableSorting: false,
        maxSize: 30,
        Cell: ({ renderedCellValue }) => TextWithIcon({ renderedCellValue }),
      },
      {
        accessorKey: "paymentType",
        header: "Payment Type",
        filterVariant: "multi-select", // Multi-select filter
        filterSelectOptions: [
          { label: "CASH", value: "CASH" },
          { label: "CARD", value: "CARD" },
          { label: "ONLINE", value: "ONLINE" },
        ],
        enableSorting: false,
        maxSize: 30,
        Cell: ({ renderedCellValue }) => TextWithIcon({ renderedCellValue }),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        filterVariant: "multi-select", // Multi-select filter
        filterSelectOptions: [
          { label: "COMPLETED", value: "COMPLETED" },
          { label: "PENDING", value: "PENDING" },
          { label: "PROCESSED", value: "PROCESSED" },
        ],
        enableSorting: false,
        Cell: ({ cell }) => (
          <AppChipComponent value={cell.getValue<string>()} />
        ),
        editVariant: "select",
        editSelectOptions: [
          { label: "COMPLETED", value: "COMPLETED" },
          { label: "PENDING", value: "PENDING" },
        ],
        maxSize: 30,
      },
      {
        accessorKey: "confirmationStatus",
        header: "Confirmation Status",
        Cell: ({ cell }) => (
          <AppChipComponent value={cell.getValue<string>()} />
        ),
        filterVariant: "multi-select", // Multi-select filter
        filterSelectOptions: [
          { label: "COMPLETED", value: "COMPLETED" },
          { label: "PENDING", value: "PENDING" },
        ],
        enableSorting: false,
        maxSize: 30,
        editVariant: "select",
        editSelectOptions: [
          { label: "COMPLETED", value: "COMPLETED" },
          { label: "PENDING", value: "PENDING" },
        ],
      },
      {
        accessorKey: "promoCode",
        header: "Promo Code",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "promoDiscount",
        header: "Promo Discount",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "orderDiscount",
        header: "Order Discount",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "driverTip",
        header: "Driver Tip",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "deliveryCharge",
        header: "Delivery Charge",
        filterVariant: "range-slider",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
        Cell: ({ renderedCellValue }) => TextWithIcon({ renderedCellValue }),
        // Range-slider for delivery charge
      },
      {
        accessorKey: "serviceFee",
        header: "Service Fee",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "subTotal",
        header: "Sub Total",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "taxes",
        header: "Taxes",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "total",
        header: "Total",
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: "branchName",
        header: "Branch Name",
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        maxSize: 30,
        Cell: ({ cell }) => (
          <AppChipComponent value={cell.getValue<string>()} />
        ),
        filterVariant: "multi-select",
        enableSorting: false,
        filterSelectOptions: [
          { label: "COMPLETED", value: "COMPLETED" },
          { label: "PENDING", value: "PENDING" },
        ],
        editVariant: "select",
        editSelectOptions: [
          { label: "COMPLETED", value: "COMPLETED" },
          { label: "PENDING", value: "PENDING" },
        ],
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <AppGridRemoteDataFetching
        data={OrdersDataApiResponse?.data?.orders ?? []}
        columnFilters={columnFilters}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        totalRowCount={OrdersDataApiResponse?.data?.totalOrders ?? 0}
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        isLoading={isLoading}
        OnFilterButonClicked={() => open()}
        OnApplyFiltersClicked={() => close()}
        filterDrawerIsOpen={opened}
        enableRowSelection={true}
        isError={isError}
      />
    </MUIThemeProvider>
  );
};

export default DisplayOrdersGrid;
