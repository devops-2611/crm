import QueryClientProviders from "./QueryClientProvider";
import App from "../App";
import MantineProviders from "./MantineProviders";
import AppBasedContextProviders from "./AppBasedContextProviders";
import { BrowserRouter } from "react-router-dom";
import { MuiXDateProvider } from "./MuiXDateProvider";
function AppWithProviders() {
  return (
    <AppBasedContextProviders>
      <MantineProviders>
        <QueryClientProviders>
          <BrowserRouter>
            <MuiXDateProvider>
              <App />
            </MuiXDateProvider>
          </BrowserRouter>
        </QueryClientProviders>
      </MantineProviders>
    </AppBasedContextProviders>
  );
}
export default AppWithProviders;
