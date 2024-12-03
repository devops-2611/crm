import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Skeleton } from "@mantine/core";
import { BasicAppShell } from "../components/BasicAppShell";
import { AdminAppShell } from "../pages/admin/adminAppShell/AdminAppShell";
import { OrdersTabsWrapper } from "../pages/admin/orders/OrdersTabsWrapper";

const HomePage = lazy(() => import("../pages/Homepage"));
const FormWrapper = lazy(
  () => import("../pages/UploadandGenrateInvoice/FormWrapper")
);
const NotFoundPage = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BasicAppShell></BasicAppShell>}>
        <Route
          index
          element={
            <Suspense>
              <HomePage />
            </Suspense>
          }
        ></Route>
        <Route
          path="/reports/generate"
          element={
            <Suspense fallback={<Skeleton height={300} width="100%" />}>
              <FormWrapper />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<Skeleton height={300} width="100%" />}>
              <HomePage />
            </Suspense>
          }
        />
      </Route>

      <Route path="/admin" element={<AdminAppShell />}>
        <Route
          path={"swishr-courier/orders"}
          element={
            <Suspense fallback={<Skeleton height={300} width="100%" />}>
              <OrdersTabsWrapper></OrdersTabsWrapper>
            </Suspense>
          }
        ></Route>
      </Route>
      <Route
        path="*"
        element={
          <Suspense fallback={<Skeleton height={300} width="100%" />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
