import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import FormWrapper from "../components/UploadandGenrateInvoice/FormWrapper";
import CustomerManagement from "../pages/admin/CustomerManagement";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/reports/generate" element={<FormWrapper />} />
      <Route path="/admin" element={<CustomerManagement />} />
    </Routes>
  )
};

export default AppRoutes;
