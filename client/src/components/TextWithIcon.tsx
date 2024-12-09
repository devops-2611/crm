import { Collections, DeliveryDining, MoneyOff } from "@mui/icons-material";
import { Box } from "@mui/material";
import React from "react";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";

const TextWithIcon = ({
  renderedCellValue,
}: {
  renderedCellValue: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        justifyContent: "center",
      }}
    >
      {renderedCellValue === "CASH" && <MoneyOff />}
      {renderedCellValue === "CARD" && <PaymentOutlinedIcon />}
      {renderedCellValue === "DELIVERY" && <DeliveryDining />}
      {renderedCellValue === "COLLECTION" && <Collections />}
      <span>{renderedCellValue}</span>
    </Box>
  );
};

export default TextWithIcon;
