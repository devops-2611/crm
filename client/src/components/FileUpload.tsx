import { Group, Text, rem, useMantineTheme, ActionIcon } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, MIME_TYPES , FileRejection, FileWithPath, } from "@mantine/dropzone";
import { useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { useFileUpload } from "../hooks/useFileUpload";
import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";


export function FileUpload() {


  const { mutateAsync, status } = useFileUpload();
  const [fileName, setFileName] = useState<string>();
  const theme = useMantineTheme();
  const handleReject = useCallback(
    (fileRejections:FileRejection[]) => {
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
  const handleDrop = async (files:FileWithPath[]) => {
    setFileName(files[0].name);
    try {
      const result = await mutateAsync(files);
      console.log("File uploaded successfully:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
//   const handleDelete = () => {
//     // Reset the file state to remove the file
//     setFileName(null);
//   };

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={handleReject}
      maxSize={5 * 1024 ** 2}
      accept={[MIME_TYPES.csv]}
      multiple={false}
      maxFiles={1}
      loading={status === "pending"}
      //   children={(vlaue)=><div>{vlaue.}</div>}
      __size=""
    >
      <Group
        justify="center"
        gap="xl"
        mih={220}
        style={{ pointerEvents: "none" }}
      >
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
          Rejected file format
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
            Attach a single file, file should not exceed 5mb
          </Text>
          {fileName && (
            <>
              <div style={{ marginTop: 10, color: "green" }}>
                Uploaded file: {fileName}
              </div>
              {/* <ActionIcon
                color="red"
                onClick={handleDelete}
                title="Remove file"
                style={{ marginLeft: 10 }}
              >
                <IconTrash size={16} />
              </ActionIcon> */}
            </>
          )}
        </div>
      </Group>
    </Dropzone>
  );
}
