import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

const uploadFiles = async (files) => {
  console.log(files, "files inside mutation fun");
  if (!files || files.length === 0) {
    return;
  }
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("file", file);
  });
  console.log(formData, "formdata");
  return await ApiHelpers.POST(ApiConstants.UPLOAD_CSV(), formData);
};

export const useFileUpload = () => {
  return useMutation({
    mutationFn: (data) => uploadFiles(data),
    retry: 0,
    onSuccess: (data) => notifications.show({
        title:'File Uploaded successfully',
        message:'Some more text here',
        color:'green',
    }),
    onError: (data) =>  notifications.show({
        title:'File Upload Failed',
        message:'Some more text here',
        color:'red',
    }),
  });
};