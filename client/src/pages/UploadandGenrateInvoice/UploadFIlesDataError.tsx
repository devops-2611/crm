import { Table, Text, Accordion, Badge, Paper, Stack } from "@mantine/core";
import { useState, forwardRef, Ref } from "react";
import { useFormikContext } from "formik";
import { ValidationErrorResponse } from "../../hooks/useUplaodAndGetCsvData";
import { FormValueTypes } from "./Step1";

interface ErrorDetailsProps {
  errorData?: ValidationErrorResponse; // errorData can be undefined
}

interface Issue {
  invalidField: string;
  invalidValue: string;
}

interface FileError {
  fileName: string;
  issues: Issue[];
}

const ErrorDetails = forwardRef<HTMLDivElement, ErrorDetailsProps>(
  function ErrorDetails(
    { errorData },
    ref: Ref<HTMLDivElement>, // Ensure ref is typed as HTMLDivElement
  ) {
    const { values } = useFormikContext<FormValueTypes>();
    const [accordionValue, setAccordionValue] = useState<string[]>(
      errorData?.details?.map((file) => file.fileName) ?? [],
    );

    if (!errorData) return null;

    // Get files from form data
    const filesPresentInForm = values.csvfile?.map((file) => file.name);

    // Filter the final errors based on form files
    const finalErrors = errorData?.details?.filter((item) =>
      filesPresentInForm?.includes(item.fileName),
    );

    // If no relevant errors, return early
    if (!finalErrors?.length) return null;

    return (
      <Paper p={20} ref={ref} shadow="sm" radius={"md"} mt={20}>
        <Stack bg="var(--mantine-color-body)" justify="center" gap="md">
          <Badge color="orange" variant="light">
            {errorData?.error}
          </Badge>
          <Text>
            Below are the files that need to be corrected. Please try again
            after uploading the correct files. Find complete details here.
          </Text>
          <Accordion
            variant="contained"
            multiple
            value={accordionValue}
            onChange={setAccordionValue}
            transitionDuration={400}
          >
            {finalErrors.map((fileData: FileError) => (
              <Accordion.Item
                key={fileData.fileName}
                variant="contained"
                value={fileData.fileName}
              >
                <Accordion.Control>{fileData.fileName}</Accordion.Control>
                <Accordion.Panel>
                  {fileData.issues.length > 0 && (
                    <Table
                      striped
                      highlightOnHover
                      withColumnBorders
                      withRowBorders
                      withTableBorder
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <th>Invalid Field</th>
                          <th>Invalid Value</th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {fileData.issues.map((issue, issueIndex) => (
                          <Table.Tr key={issueIndex}>
                            <Table.Td>{issue.invalidField}</Table.Td>
                            <Table.Td>{issue.invalidValue}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Stack>
      </Paper>
    );
  },
);

export default ErrorDetails;
