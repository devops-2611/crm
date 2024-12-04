import { APPTabs } from "../../../components/CoreUI/tabs/AppTabs";
import DisplayOrders from "./DisplayOrders";
import UplaodOrders from "./UploadOrders";
export function OrdersTabsWrapper() {
  const tabs = [
    { label: "All Orders", value: "1", content: <DisplayOrders /> },
    { label: "Upload Files", value: "2", content: <UplaodOrders /> },
  ];

  return <APPTabs tabs={tabs} />;
}
