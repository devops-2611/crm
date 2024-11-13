import QueryClientProviders from "./QueryClientProvider";
import App from "../App";
import MantineProviders from "./MantineProviders";
import AppBasedContextProviders from "./AppBasedContextProviders";
import { BrowserRouter } from "react-router-dom";
function AppWithProviders() {
  return (
    <AppBasedContextProviders>
      <MantineProviders>
        <QueryClientProviders>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProviders>
      </MantineProviders>
    </AppBasedContextProviders>
  );
}
export default AppWithProviders;
