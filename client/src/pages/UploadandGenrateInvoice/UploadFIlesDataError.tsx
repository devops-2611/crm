import { Container, Table, Text, Accordion, Badge } from "@mantine/core";
import { Stack } from "@mantine/core";
import { useState } from "react";
import { useFormikContext } from "formik";
import { ValidationErrorResponse } from "../../hooks/useUplaodAndGetCsvData";
import { FormValueTypes } from "./Step1";

interface ErrorDetailsProps {
  errorData: ValidationErrorResponse | undefined;
}

const ErrorDetails = ({ errorData }: ErrorDetailsProps) => {
  const { values } = useFormikContext<FormValueTypes>();
  const [accordionValue, setAccordionValue] = useState<string[]>(
    errorData?.details?.map((file) => file.fileName) ?? []
  );

  if (!errorData) return null;

  // Get files from form data
  const filesPresentInForm = values.csvfile?.map((file) => file.name);

  // Filter the final errors based on form files
  const finalErrors = errorData?.details?.filter((item) =>
    filesPresentInForm?.includes(item.fileName)
  );

  // If no relevant errors, return early
  if (!finalErrors?.length) return null;

  return (
    <Container p={20}>
      <Stack bg="var(--mantine-color-body)" justify="center" gap="md">
        <Badge color="orange" variant="light">
          {errorData?.error}
        </Badge>
        <Text>Below Files Need to be Corrected. Find Complete Details Here</Text>
        <Accordion
          variant="contained"
          multiple
          value={accordionValue}
          onChange={setAccordionValue}
          transitionDuration={400}
        >
          {finalErrors.map((fileData) => (
            <Accordion.Item
              key={fileData.fileName}
              variant="contained"
              value={fileData.fileName}
            >
              <Accordion.Control>{fileData.fileName}</Accordion.Control>
              <Accordion.Panel>
                {fileData.issues.length > 0 && (
                  <Table striped highlightOnHover cellSpacing="xs" bgcolor="red">
                    <thead>
                      <tr>
                        <th>Invalid Field</th>
                        <th>Invalid Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.issues.map((issue, issueIndex) => (
                        <tr key={issueIndex}>
                          <td>{issue.invalidField}</td>
                          <td>{issue.invalidValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Stack>
    </Container>
  );
};

export default ErrorDetails;
