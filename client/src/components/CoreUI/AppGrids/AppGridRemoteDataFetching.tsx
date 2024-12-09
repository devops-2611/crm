import {
  MaterialReactTable,
  MRT_EditActionButtons,
  MRT_RowData,
  MRT_ShowHideColumnsButton,
  MRT_TableHeadCellFilterContainer,
  MRT_TableOptions,
  MRT_ToggleFullScreenButton,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  lighten,
  Stack,
  Tooltip,
} from "@mui/material";
import { GridFilterDrawer } from "../GridFilterDrawer/GridFilterDrawer";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useDeleteOrderByID } from "../../../pages/admin/orders/DisplayOrders/useDeleteOrderByID";
import { useUpdateOrders } from "../../../pages/admin/orders/DisplayOrders/useUpdateOrders";
import { modals } from "@mantine/modals";
import { Text as MantineText } from "@mantine/core";
import { DeleteForeverRounded } from "@mui/icons-material";
import { ClearIcon } from "@mui/x-date-pickers";
import "./ScrollBAr.css";
import { Order } from "../../../pages/admin/orders/DisplayOrders/useGetAllOrders";
// Generic props type for the grid
type DataGridProps<T extends MRT_RowData> = {
  columns: MRT_ColumnDef<T>[]; // Column definitions to render in the table
  data: T[]; // Data to be displayed in the table
  pagination: MRT_PaginationState; // Pagination state
  sorting: MRT_SortingState; // Sorting state
  columnFilters: MRT_ColumnFiltersState; // Column filters
  onPaginationChange: (pagination: MRT_PaginationState) => void; // Pagination change handler
  onSortingChange: (sorting: MRT_SortingState) => void; // Sorting change handler
  onColumnFiltersChange: (filters: MRT_ColumnFiltersState) => void; // Filter change handler
  isLoading?: boolean; // Optional loading state
  isError?: boolean; // Optional error state
  totalRowCount: number;
  OnFilterButonClicked: () => void;
  OnApplyFiltersClicked: () => void;
  filterDrawerIsOpen: boolean;
  enableRowSelection: boolean; // Total row count for pagination
};

const DataGrid = <T extends object>({
  columns,
  data,
  pagination,
  sorting,
  columnFilters,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  isLoading = false,
  isError = false,
  totalRowCount,
  OnFilterButonClicked,
  filterDrawerIsOpen = false,
  OnApplyFiltersClicked,
  enableRowSelection = false,
}: DataGridProps<T>) => {
  const {
    mutateAsync: deleteOrdersMutateAsync,
    isPending: isDeletingOrderIds,
  } = useDeleteOrderByID();
  const {
    mutateAsync: updateOrdersMuatateAsync,
    isPending: IsUpdatingOrderIds,
  } = useUpdateOrders();
  const handleDeleteOrder = (IDs: string) => {
    modals.openConfirmModal({
      title: (
        <MantineText size="md" style={{ fontWeight: "600" }}>
          Are you sure you want to proceed?
        </MantineText>
      ),
      children: (
        <MantineText size="sm">This action will delete your order.</MantineText>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => {
        deleteOrdersMutateAsync(IDs);
      },
    });
  };
  const handleUpdateOrder: MRT_TableOptions<Order>["onEditingRowSave"] = ({
    values,
  }) => {
    updateOrdersMuatateAsync({ updates: [values] });
    table.setEditingRow(null);
  };
  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      showColumnFilters: false,
      density: "compact",
      columnPinning: {
        left: ["mrt-row-select", "mrt-row-actions"],
        // right: ['mrt-row-actions'],
      },
    },

    enableMultiSort: false,
    enableRowSelection,
    getRowId: (originalRow) => originalRow?.orderId,
    columnFilterDisplayMode: "custom",
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,

    muiTableHeadCellProps: {
      align: "center",
      sx: (theme) => ({
        color: "white",
        // backgroundColor:theme.palette.primary.light,
        backgroundColor: "#12B886",

        // paddingTop: "5px",
        // paddingButton: "5px",
        borderRight: "0.5px solid white",
      }),
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 30, 50],
      SelectProps: { style: { fontSize: 14 } },
    },

    positionToolbarAlertBanner: "bottom",
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : IsUpdatingOrderIds || isDeletingOrderIds
        ? {
            color: "info",
            children: "Please wait...........",
          }
        : { color: "success" },
    muiTableBodyProps: {
      sx: {
        //stripe the rows, make odd rows a darker color
        "& tr:nth-of-type(odd) > td": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    muiTableBodyCellProps: {
      align: "center",
      sx: {
        borderRight: "0.5px solid grey",
      },
    },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Edit",
      },
    },
    muiColumnActionsButtonProps: {
      style: { color: "white" },
    },
    onColumnFiltersChange: onColumnFiltersChange,
    onSortingChange: onSortingChange,
    onPaginationChange: onPaginationChange,
    enableStickyHeader: true,
    enableRowActions: true,
    enableEditing: true,
    onEditingRowSave: handleUpdateOrder,
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Edit Order</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),

    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const handleDelete = () => {
        const getOrderIdsofSlectedRows = table
          .getSelectedRowModel()
          .flatRows.map((row) => {
            return row.original?.orderId;
          })
          ?.join(",");
        // table.setRowSelection()
        handleDeleteOrder(getOrderIdsofSlectedRows);
      };

      const handleClearFilters = () => {
        table.resetColumnFilters();
      };

      return (
        <Box
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.05),
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <Box
            sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          ></Box>
          <Box>
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Tooltip title="Delete selected rows" placement="top">
                <IconButton
                  color="error"
                  disabled={
                    !table.getIsAllPageRowsSelected() &&
                    !table.getIsSomeRowsSelected()
                  }
                  onClick={handleDelete}
                  size="small"
                >
                  <DeleteForeverRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Filters" placement="top">
                <IconButton
                  onClick={handleClearFilters}
                  color="primary"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Apply Filters" placement="top">
                <IconButton
                  onClick={OnFilterButonClicked}
                  color="primary"
                  size="small"
                >
                  <FilterAltIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      );
    },
    rowCount: totalRowCount, // Pass total row count for pagination
    state: {
      columnFilters,
      isLoading,
      pagination,
      showAlertBanner: isError,
      sorting,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <GridFilterDrawer
        close={OnApplyFiltersClicked}
        opened={filterDrawerIsOpen}
        children={
          <Stack p="8px" gap="8px">
            {table.getLeafHeaders().map((header) => {
              if (header.column.getCanFilter()) {
                return (
                  <MRT_TableHeadCellFilterContainer
                    key={header.id}
                    header={header}
                    table={table}
                    in
                  />
                );
              }
            })}
          </Stack>
        }
      />
    </>
  );
};

export default DataGrid;
