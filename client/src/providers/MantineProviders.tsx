// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ReactNode } from "react";
interface MantineProvidersProps {
  children: ReactNode;
}
export default function MantineProviders({ children }:MantineProvidersProps) {
  return (
    <MantineProvider>
      <Notifications autoClose={5000} />
      {children}
    </MantineProvider>
  );
}