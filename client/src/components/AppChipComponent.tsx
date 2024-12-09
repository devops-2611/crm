import { Box, Chip } from "@mui/material";
import { getChipColor } from "../utility/helperFuntions";

const AppChipComponent = ({ value }: { value: string }) => {
  if (!value) {
    return null;
  }
  return (
    <Chip
      label={value}
      color={getChipColor(value)}
      size="small"
      variant="outlined"
    />
  );
};

export default AppChipComponent;
