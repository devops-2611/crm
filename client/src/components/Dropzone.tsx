import { ActionIcon, Box, Group, List, Text, ThemeIcon, rem, useMantineTheme } from "@mantine/core";
import { IconUpload, IconPhoto, IconX, IconTrash, IconCircleCheck } from "@tabler/icons-react";
import {
  Dropzone,
  MIME_TYPES,
  FileRejection,
  FileWithPath,
} from "@mantine/dropzone";
import { useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { useFormikContext } from "formik";
import { FormValueTypes } from "../pages/UploadandGenrateInvoice/Step1";
import React from "react";
function findCommonStrings(array1: string[], array2: string[]) {
  const set1 = new Set(array1);

  const commonStrings = array2.filter((item) => set1.has(item));

  return commonStrings;
}



function findDuplicates(arr: string[]) {
  const duplicates = [];
  const seen = new Set();
  const seenDuplicates = new Set();

  for (const str of arr) {
    if (seen.has(str)) {
      if (!seenDuplicates.has(str)) {
        duplicates.push(str);
        seenDuplicates.add(str);
      }
    } else {
      seen.add(str);
    }
  }

  return duplicates;
}
export function FileUpload() {
  const { values, setFieldValue, errors } = useFormikContext<FormValueTypes>();
  const theme = useMantineTheme();
console.log(errors?.csvfile,"checknowwwwww")
  const handleReject = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections[0].errors[0].code === "file-invalid-type") {
        notifications.show({
          title: "Invalid File type",
          message: "Only CSV file format is allowed",
          color: theme.colors.red[6],
          autoClose: 5000,
        });
      }
    },
    [theme]
  );

  const handleDrop = async (files: FileWithPath[]) => {
    const getDuplicateFilesInBulkUpload = findDuplicates(
      files?.map((file) => file.name)
    );
    if (getDuplicateFilesInBulkUpload?.length) {
      notifications?.show({
        title: "Dupllicate Files",
        message: getDuplicateFilesInBulkUpload?.toString(),
        color: "red",
      });
      return;
    }
    if (values?.csvfile && values?.csvfile?.length > 0) {
      const existingFileNames = values?.csvfile?.map((file) => file.name);
      const Duplicates = findCommonStrings(
        files?.map((file) => file.name),
        existingFileNames
      );
      if (Duplicates?.length > 0) {
        notifications.show({
          title: "You have already added some files",
          message: Duplicates?.toString(),
          color: "red",
        });
        return;
      }
      setFieldValue("csvfile", [...values.csvfile, ...files]);
      return;
    }
    setFieldValue("csvfile", files);
  };

  const handleDeleteUploaded = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    fileName: string
  ) => {
    e.stopPropagation();
    const updatedFiles =
      values.csvfile?.filter((file) => file.name !== fileName) || [];
    if (updatedFiles?.length === 0) {
      setFieldValue("csvfile", null);
      return;
    }
    setFieldValue("csvfile", updatedFiles);
  };
  // const displayErrors =(e,fileName:string)=>{
  //   e.stopPropagation();
  //   console.log(errors?.csvfile.details)
  //   const check = errors?.csvfile.details?.find((file)=>file.fileName ===fileName)
  //   console.log(check)
  // }
  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={handleReject}
      maxSize={5 * 1024 ** 2}
      maxFiles={10}
      accept={[MIME_TYPES.csv,MIME_TYPES.xlsx, MIME_TYPES.xls]}
      name={"csvfile"}
      style={{
        display: "flex",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <Group justify="center" gap="xl">
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
          Only CSV file format is allowed
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag CSV format file here
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Attach multiple files. Each file should not exceed 5 MB, and the
            total file count should not exceed 10.
          </Text>

          {values?.csvfile && values?.csvfile?.length > 0 && (
            <div style={{ marginTop: 10, color: "green" }}>
              <List
                spacing="xs"
                size="sm"
                style={{ pointerEvents: "all" }}
                center
                icon={
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCircleCheck
                      style={{ width: rem(16), height: rem(16) }}
                    />
                    
                  </ThemeIcon>
                  
                }
              >
                Uploaded file:{" "}
                {values?.csvfile.map((file) => (
                  <List.Item key={file.name + `${file.size}`}>
                    <Group align="center">
                      <Box>{file.name}</Box>
                      <ActionIcon
                        onClick={(e) => handleDeleteUploaded(e, file.name)}
                        style={{ pointerEvents: "all" }}
                        variant="transparent"
                        color={"green"}
                        key={file.name}
                      >
                        <IconTrash />
                      </ActionIcon>
                      {/* <ActionIcon  style={{ pointerEvents: "all" }} onClick={(e)=>displayErrors(e,file.name)}    key={file.name}><IconCircleX style={{ width: rem(20), height: rem(20) }} /></ActionIcon> */}
                    </Group>
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </div>
      </Group>
    </Dropzone>
  );
}
