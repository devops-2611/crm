import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import ApiHelpers from "../../../../api/ApiHelpers";
import ApiConstants from "../../../../api/ApiConstants";
import { Order } from "./useGetAllOrders";
import { notifications } from "@mantine/notifications";
interface UpdateOrderResult {
  orderId: number;
  success: boolean;
  message: string;
}

interface UpdateOrderSuccessResponse {
  success: true;
  results: UpdateOrderResult[];
}
interface UpdateOrderErrorResponse {
  success: false;
  message?: string; // e.g., "No updates provided"
  error?: string; // e.g., "Server error"
  details?: string; // Additional details about the error (optional)
  errors?: { field: string; message: string }[]; // Field-specific errors
}
interface AxiosRequestError {
  message: string;
  code?: string;
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: any;
  };
}
function updateOrder({
  updates,
}: {
  updates: Order[];
}): Promise<AxiosResponse<UpdateOrderSuccessResponse>> {
  const url = ApiConstants.UPDATE_ORDER_BY_ID(); // Replace the orderId in the URL
  return ApiHelpers.PUT(url, updates); // PUT request to update the order
}

// Define the useUpdateOrderByID hook
export const useUpdateOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: Order[] }) => updateOrder({ updates }),
    onSuccess: (data) => {
      notifications.show({
        title: `OrderID: ${data?.data?.results?.[0]?.orderId}`,
        message: data?.data?.results?.[0]?.message ?? "Success",
        color: "green",
        autoClose: 2000,
      });
      queryClient.removeQueries({ queryKey: ["Orders-Grid-data"] });
      queryClient.invalidateQueries({ queryKey: ["Orders-Grid-data"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<
          UpdateOrderErrorResponse | AxiosRequestError
        >;

        if (axiosError.response) {
          notifications.show({
            title: "Edit Operation Failed",
            message:
              axiosError.response.data?.message ?? "Something went wrong",
            color: "red",
            autoClose: 5000,
          });
        } else if (axiosError.request) {
          notifications.show({
            title: "Axios Error",
            message: axiosError.request,
            color: "red",
            autoClose: 5000,
          });
        } else {
          // Handle unexpected error
          notifications.show({
            title: "Unexpected error",
            message: axiosError.message,
            color: "red",
            autoClose: 5000,
          });
        }
      } else {
        console.error("Non-Axios error:", error);
      }
    },

    onSettled: () => {
      // Optionally, you can use onSettled to trigger actions like invalidating queries or refetching
    },
  });
};
