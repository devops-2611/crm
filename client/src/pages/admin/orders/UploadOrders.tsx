import React, { useRef } from "react";
import { Formik, Form, FormikProps } from "formik";
import * as Yup from "yup";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text as MantineText,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FileWithPath, FileRejection } from "@mantine/dropzone";
import { FileUpload } from "../../../components/CoreUI/FileUpload";
import { useUploadOrdersFiles } from "../../../hooks/useUploadOrdersFiles";
import { UploadOrderErrorDisplay } from "./UploadOrderErrorDisplay";

interface FormValues {
  csvfile: FileWithPath[];
}

const validationSchema = Yup.object({
  csvfile: Yup.array()
    .min(1, "You must upload at least one file.")
    .required("CSV file is required."),
});

const UplaodOrders: React.FC = () => {
  const initialValues: FormValues = { csvfile: [] };
  const FormikRef = useRef<FormikProps<FormValues>>(null);
  const theme = useMantineTheme();
  const {
    mutate: uploadFiles,
    error: ErrorOnUploadingFiles,
    reset: ResetMutation,
  } = useUploadOrdersFiles();

  const handleSubmit = (values: FormValues) => {
    uploadFiles(
      { csvfile: values.csvfile },
      {
        onSuccess: (data) => {
          notifications.show({
            title: "Success",
            message: data.data?.message || "Files uploaded successfully!",
            color: "green",
          });
          FormikRef.current?.resetForm();
        },
        onError: (error: any) => {
          notifications.show({
            title: "Error",
            message: error.response?.data?.message || "Failed to upload files.",
            color: "red",
          });
          FormikRef.current?.setErrors(error);
        },
      },
    );
  };

  return (
    <Paper shadow="sm" p={20}>
      <Stack gap={20}>
        <MantineText>Some Fancy Text Here</MantineText>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          innerRef={FormikRef}
          onReset={() => ResetMutation()}
        >
          {({ values, errors, touched, setFieldValue }) => {
            const handleDrop = (newFiles: FileWithPath[]) => {
              setFieldValue("csvfile", [...values.csvfile, ...newFiles]);
            };

            const handleReject = (rejectedFiles: FileRejection[]) => {
              notifications.show({
                title: "Invalid Files",
                message: "Some files were rejected due to invalid format.",
                color: "red",
              });
              console.error("Rejected files:", rejectedFiles);
            };

            const handleDeleteFile = (fileName: string) => {
              const updatedFiles = values.csvfile.filter(
                (file) => file.name !== fileName,
              );
              setFieldValue("csvfile", updatedFiles);
            };

            return (
              <Form>
                <FileUpload
                  onDrop={handleDrop}
                  onReject={handleReject}
                  uploadedFiles={values.csvfile}
                  onDeleteFile={handleDeleteFile}
                  dropzoneText={{
                    title: "Upload your CSV files",
                    description:
                      "You can upload multiple CSV files. Each file must be under 5 MB.",
                    rejectMessage:
                      "Invalid file type. Only CSV files are allowed.",
                  }}
                />
                {errors.csvfile && touched.csvfile && (
                  <div style={{ color: "red", marginTop: "10px" }}>
                    {errors?.csvfile}
                  </div>
                )}

                <Group mt="md" justify="center">
                  <Button type="submit" loading={false}>
                    Submit
                  </Button>
                  <Button type="reset" variant="outline">
                    Reset
                  </Button>
                </Group>
              </Form>
            );
          }}
        </Formik>
        {FormikRef.current?.errors && (
          <UploadOrderErrorDisplay
            response={ErrorOnUploadingFiles?.response?.data}
          />
        )}
      </Stack>
    </Paper>
  );
};

export default UplaodOrders;
