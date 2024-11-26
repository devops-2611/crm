import { PDFViewer, usePDF } from "@react-pdf/renderer";
import InvoicePDF from "./Step3";
import { Button, Group, Loader, Modal, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronLeft, IconXboxX } from "@tabler/icons-react";
import { IconDownload, IconEye } from "@tabler/icons-react";

interface InvoicePreviewProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

const DonwloadButton = ({ setActiveStep }: InvoicePreviewProps) => {
  const GETDocument = InvoicePDF();
  const [instance, updateInstance] = usePDF({ document: GETDocument });
  const [opened, { open, close }] = useDisclosure(false);

  // Error and loading state handling
  const renderLoading = () => (
    <Group>
      <Text>Loading ...</Text> <Loader size={30} />
    </Group>
  );

  const renderError = () => <Text>Something Went Wrong</Text>;

  const renderPreviewModal = () => (
    <Modal
      opened={opened}
      onClose={close}
      title="Here is the generated invoice"
      fullScreen
      radius={0}
      transitionProps={{ transition: "fade", duration: 200 }}
      closeButtonProps={{
        icon: <IconXboxX size={30} stroke={1.5} />,
      }}
    >
      <PDFViewer style={{ width: "100%", height: "100vh" }}>
        {GETDocument}
      </PDFViewer>
    </Modal>
  );

  const renderDownloadButton = () => (
    <Button
      component="a"
      data-disable={instance.loading}
      href={instance.url ?? ""}
      download="some_name.pdf"
      loading={instance.loading}
      leftSection={<IconDownload />}
    >
      Download Invoice
    </Button>
  );

  const renderPreviewButton = () => (
    <Button
      variant="outline"
      loading={instance.loading}
      disabled={instance.loading}
      onClick={open}
      leftSection={<IconEye />}
    >
      Preview Invoice
    </Button>
  );

  const renderGoBackButton = () => (
    <Button
      variant="filled"
      onClick={() => setActiveStep((prev) => prev - 1)}
      leftSection={<IconChevronLeft />}
    >
      Go Back
    </Button>
  );

  return (
    <Paper shadow="sm" radius="md" p="xl" mt={20}>
      <Stack p={20} gap={50}>
        {instance.loading && renderLoading()}
        {instance.error && renderError()}

        {!instance.error && !instance.loading && (
          <Group justify="center">
            {renderDownloadButton()}
            {renderPreviewButton()}
          </Group>
        )}

        {renderGoBackButton()}

        {!instance.error && renderPreviewModal()}
      </Stack>
    </Paper>
  );
};

export default DonwloadButton;
