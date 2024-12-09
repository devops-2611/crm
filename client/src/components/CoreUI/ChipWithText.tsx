import { Chip, ChipProps, rem } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

// Reusable Chip component
function ChipWithText({
  icon,
  color,
  variant,
  defaultChecked,
  children,
  ...props
}: Readonly<ChipProps>) {
  return (
    <Chip
      icon={icon ? <IconX style={{ width: rem(16), height: rem(16) }} /> : null}
      color={color}
      variant={variant}
      defaultChecked={defaultChecked}
      {...props}
    >
      {children}
    </Chip>
  );
}
