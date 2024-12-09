import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import ApiHelpers from "../../../../api/ApiHelpers";
import ApiConstants from "../../../../api/ApiConstants";
import { ColumnFilter } from "@tanstack/table-core";
import dayjs from "dayjs";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";

// Enum for predefined values
enum OrderType {
  DELIVERY = "DELIVERY",
  COLLECTION = "COLLECTION",
}

enum PaymentType {
  CARD = "CARD",
  CASH = "CASH", // Assuming CASH could be a possible payment type, you can add more types
  OTHER = "OTHER", // Extend with more types if needed
}

enum PaymentStatus {
  PROCESSED = "PROCESSED",
  PENDING = "PENDING",
  FAILED = "FAILED", // Extend with more statuses if needed
}

enum ConfirmationStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING", // Add more statuses if needed
}

// Interface for an order
export interface Order {
  _id: string; // Unique identifier for the order
  orderId: string; // Order number
  orderDate: string; // ISO string representing the date and time the order was made
  customerId: string; // Customer's unique identifier
  customerFirstName: string; // Customer's first name
  customerLastName: string; // Customer's last name
  orderType: OrderType; // Type of order (DELIVERY or COLLECTION)
  paymentType: PaymentType; // Payment method used (CARD, CASH, etc.)
  paymentStatus: PaymentStatus; // Payment status (PROCESSED, PENDING, etc.)
  confirmationStatus: ConfirmationStatus; // Confirmation status (COMPLETED, PENDING, etc.)
  promoCode?: string; // Optional promo code if applied
  promoDiscount: number; // Discount applied via promo code, if any
  orderDiscount: number; // General order discount
  driverTip: number; // Tip for the driver
  deliveryCharge: number; // Delivery charge
  serviceFee: number; // Service fee
  subTotal: number; // Subtotal of the order before taxes and fees
  taxes: number; // Taxes on the order
  total: number; // Total order amount
  branchName: string; // Store or branch where the order was placed
  merchantId?: string; // Merchant's ID if applicable
  status?: string; // Status of the order (optional, could be empty or a defined set of values)
  __v: number; // Version key (commonly used in MongoDB for versioning)
  createdAt: string; // ISO string for the order creation date
  updatedAt: string; // ISO string for the last updated date
}

// Interface for the response from the API
interface GetAllOrdersResponse {
  orders: Order[]; // Array of orders
  currentPage: number; // Current page of the results
  totalPages: number; // Total number of pages available
  totalOrders: number; // Total number of orders in the database
}

function getFormattedDayFromDayjs(dayjsObj) {
  // date in YYYY-MM-DD format
  return dayjsObj.format("YYYY-MM-DD");
}
const allowedParammsInBAckend = [
  "merchantId",
  "pageNo",
  "limit",
  "customerId",
  "orderType",
  "paymentType",
  "confirmationStatus",
  "status",
  "paymentStatus",
  "branchName",
] as const;
// Use a union type of allowed keys
type AllowedParams = (typeof allowedParammsInBAckend)[number];
// Params type that allows only keys from allowedParammsInBAckend or an empty object
type Params = {
  [key in AllowedParams]?: any;
};
const ExtractedcolumnFiltersForParams = (columnFilters: ColumnFilter[]) => {
  let params: Params = {};

  columnFilters?.forEach((columnFilter) => {
    if (allowedParammsInBAckend?.includes(columnFilter.id as AllowedParams)) {
      if (Array.isArray(columnFilter.value)) {
        params[columnFilter.id as AllowedParams] =
          columnFilter.value?.join(",");
      } else {
        params[columnFilter.id as AllowedParams] = columnFilter.value;
      }
    }
  });
  return params;
};
const formatSortForParams = (sorting: MRT_SortingState) => {
  let sort = "";
  const columnID = sorting?.[0]?.id;
  const sortDirection = sorting?.[0]?.desc;
  if (columnID === "customerFirstName" && sortDirection) {
    sort = "ascFirstName";
  } else if (columnID === "customerFirstName" && !sortDirection) {
    sort = "descFirstName";
  } else if (columnID === "customerLastName" && sortDirection) {
    sort = "ascLastName";
  } else if (columnID === "customerLastName" && !sortDirection) {
    sort = "descLastName";
  } else if (columnID === "orderDate" && sortDirection) {
    sort = "ascOrder";
  } else if (columnID === "orderDate" && !sortDirection) {
    sort = "descOrder";
  }
  if (sort) {
    return { sort };
  }
};
const formatDateForParams = (columnFilters: ColumnFilter[]) => {
  let startDate = "";
  let EndDate = "";
  const getDateColumn = columnFilters?.find(
    (column) => column.id === "orderDate",
  );
  if (getDateColumn) {
    startDate = getDateColumn?.value[0]
      ? getFormattedDayFromDayjs(dayjs(getDateColumn?.value[0]))
      : "";
    EndDate = getDateColumn?.value[1]
      ? getFormattedDayFromDayjs(dayjs(getDateColumn?.value[1]))
      : "";
  }
  if (startDate || EndDate) {
    return { startDate, EndDate };
  }
};
function fetchOrders(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState,
): Promise<AxiosResponse<GetAllOrdersResponse>> {
  const finalQueryParams = {
    merchantId: null,
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_ALL_ORDERS(), {
    params: finalQueryParams,
  });
}
interface GEtAllOrdersProps {
  columnFilters: ColumnFilter[];
  EnableQuery: boolean;
  sorting: MRT_SortingState;
  pagination: MRT_PaginationState;
}
export const useGETALLOrdersWithFilters = (props: GEtAllOrdersProps) => {
  const { columnFilters, EnableQuery, sorting, pagination } = props;
  const queryClient = useQueryClient();
  const queryKey = ["Orders-Grid-data", columnFilters, sorting, pagination];
  return useQuery({
    queryKey: queryKey,
    queryFn: () => {
      const cachedData = queryClient.getQueryData(queryKey);
      // Return cached data if it exists and the query is being enabled
      if (cachedData && EnableQuery) {
        return cachedData;
      }
      return fetchOrders(columnFilters, sorting, pagination);
    },
    placeholderData: keepPreviousData,
    enabled: EnableQuery,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
