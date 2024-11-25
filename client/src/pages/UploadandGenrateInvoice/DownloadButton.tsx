import { PDFViewer, usePDF } from "@react-pdf/renderer";
import InvoicePDF from "./Step3";
import { Button, Group, Loader, Modal, Paper, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronLeft, IconXboxX } from "@tabler/icons-react";
import { IconDownload } from "@tabler/icons-react";
import { IconEye } from "@tabler/icons-react";
interface InvoicePreviewProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}
const DonwloadButton = ({ setActiveStep }: InvoicePreviewProps) => {
  const GETDocument = InvoicePDF();
  const [instance, updateInstance] = usePDF({ document: GETDocument });
  const [opened, { open, close }] = useDisclosure(false);


  if (instance.error) return <div>Something went wrong: {instance.error}</div>;
  console.log(instance.error);

  return (
    <Paper shadow="sm" radius="md" p="xl">
      <Stack p={20} gap={50}>
        {instance.loading && (
          <Group>
            <Title>Loading ...</Title> <Loader size={30} />
          </Group>
        )}
        <Group justify="center">
          <Button
            component="a"
            data-disable={instance.loading}
            onClick={(event) => event.preventDefault()}
            href={instance.url ?? ""}
            download="some name.pdf"
            loading={instance.loading}
            leftSection={<IconDownload />}
          >
            Download Invoice
          </Button>
          <Button
            variant="outline"
            loading={instance.loading}
            disabled={instance.loading}
            onClick={open}
            leftSection={<IconEye />}
          >
            Preview Invoice
          </Button>
        </Group>
        <Button
          variant="filled"
          onClick={() => setActiveStep((prev) => prev - 1)}
          leftSection={<IconChevronLeft />}
        >
          Go Back (todo)
        </Button>
        <Modal
          opened={opened}
          onClose={close}
          title="Here is the genearted invoice"
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
      </Stack>
    </Paper>
  );
};

export default DonwloadButton;
