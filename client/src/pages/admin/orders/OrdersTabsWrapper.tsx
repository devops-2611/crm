import { APPTabs } from "../../../components/CoreUI/tabs/AppTabs";
import FileUploadWithFormik from "./UploadOrders";
import DisplayOrders from "./DisplayOrders";
export function OrdersTabsWrapper() {
  const tabs = [
    { label: "All Orders", value: "1", content: <DisplayOrders /> },
    { label: "Upload Files", value: "2", content: <FileUploadWithFormik /> },
  ];

  return <APPTabs tabs={tabs} />;
}
