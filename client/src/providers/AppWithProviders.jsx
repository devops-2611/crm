import QueryClientProviders from "./QueryClientProvider";
import App from "../App";
import MantineProviders from "./MantineProviders";
import AppBasedContextProviders from "./AppBasedContextProviders";
function AppWithProviders() {
  return (
    <AppBasedContextProviders>
      <MantineProviders>
        <QueryClientProviders>
          <App />
        </QueryClientProviders>
      </MantineProviders>
    </AppBasedContextProviders>
  );
}
export default AppWithProviders;
