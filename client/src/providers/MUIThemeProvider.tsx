import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button, Select, MenuItem, Typography } from "@mui/material";
import { ReactNode } from "react";
interface MuiThemeProviderProps {
  children: ReactNode;
}
const theme = createTheme({
  palette: {
    primary: {
      main: "#006A4E", // Teal
    },
    secondary: {
      main: "#9E9E9E", // Grey
    },
  },
  components: {
    // Override default button styles
    // MuiButton: {
    //   styleOverrides: {
    //     root: {
    //       fontSize: "1rem", // Set the default font size for all buttons
    //       padding: "8px 16px", // Adjust padding
    //     },
    //   },
    // },
    // Override default select/dropdown styles
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: "0.5rem", // Set font size for select dropdowns
          padding: "1px 2px", // Adjust padding
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          minWidth: "160px", // Adjust default width of menu
        },
      },
    },
  },
});

function MUIThemeProvider({ children }: Readonly<MuiThemeProviderProps>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default MUIThemeProvider;
