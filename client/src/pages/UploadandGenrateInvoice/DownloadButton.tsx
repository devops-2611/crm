import { usePDF } from "@react-pdf/renderer";
import InvoicePDF from "./Step3";
const DonwloadButton = () => {
  const [instance, updateInstance] = usePDF({ document: InvoicePDF() });

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;
  console.log(instance.error)

  return (
    <a href={instance?.url} download="test.pdf">
      Download
    </a>
  );
};

export default DonwloadButton;
