import { Drawer } from "@mantine/core";
interface GridFilterDrawerTypes {
  children: React.ReactNode;
  opened: boolean;
  close: () => void;
}
export function GridFilterDrawer(props: GridFilterDrawerTypes) {
  const { children, close, opened } = props;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="Grid Filters"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        position="right"
      >
        {children}
      </Drawer>
    </>
  );
}
