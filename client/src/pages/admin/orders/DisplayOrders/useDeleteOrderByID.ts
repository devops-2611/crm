import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import ApiHelpers from "../../../../api/ApiHelpers";
import ApiConstants from "../../../../api/ApiConstants";
import { notifications } from "@mantine/notifications";
import { DefaultMantineColor } from "@mantine/core";

interface DeleteOrderResponse {
  success: boolean;
  message: string;
}
const showErrorNotification = (
  title: string,
  message: string,
  color: DefaultMantineColor,
) => {
  notifications.show({
    title,
    message,
    color,
    autoClose: 5000,
  });
};

const handleError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const errorMessage = error?.response?.data?.message ?? "Request Failed";
    showErrorNotification(errorMessage, "Request Failed", "red");
  } else {
    showErrorNotification(
      "Failed to perform the action",
      "Something went wrong",
      "red",
    );
  }
  console.error("Error occurred:", error);
};

function deleteOrder(id: string): Promise<AxiosResponse<DeleteOrderResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_ORDER_BY_ID(id));
}

export const useDeleteOrderByID = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ["Orders-Grid-data"] });
      queryClient.invalidateQueries({ queryKey: ["Orders-Grid-data"] });
      notifications.show({
        title: "Record deleted successfully",
        message: "Success",
        color: "green",
        autoClose: 2000,
      });
    },
    onError: (error) => {
      handleError(error);
      console.error("Error deleting order", error);
    },
    // Optionally you can provide onSettled to handle actions like invalidating queries or refetching
    onSettled: () => {
      // Optionally invalidate or refetch queries if needed
    },
  });
};
