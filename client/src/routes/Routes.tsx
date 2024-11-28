import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import FormWrapper from "../pages/UploadandGenrateInvoice/FormWrapper";
import CustomerManagement from "../pages/admin/CustomerManagement";
import NotFoundPage from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/reports/generate" element={<FormWrapper />} />
      <Route path="/admin" element={<CustomerManagement />} />
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
};

export default AppRoutes;
