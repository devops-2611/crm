import {
  Text,
  Group,
  ScrollArea,
  UnstyledButton,
  AppShell,
  Transition,
  Burger,
  Image,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMap,
  IconChartLine,
  IconShoppingCart,
  IconUsers,
  IconDiscount2,
  IconCode,
  IconFileReport,
  IconBriefcase,
  IconCreditCard,
  IconMessages,
  IconBuilding,
  IconDashboard,
  IconUser,
} from "@tabler/icons-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const navLinks = [
  { icon: IconMap, label: "Locations", color: "#9C27B0" },
  { icon: IconChartLine, label: "Analytics", color: "#2196F3" },
  { icon: IconShoppingCart, label: "Orders", color: "#4CAF50" },
  { icon: IconUsers, label: "Customers", color: "#FFC107" },
  { icon: IconDiscount2, label: "Order Discounts", color: "#9C27B0" },
  { icon: IconCode, label: "Promo Codes", color: "#00BCD4" },
  { icon: IconFileReport, label: "Order Reports", color: "#FF5722" },
  { icon: IconBriefcase, label: "Business Categories", color: "#8BC34A" },
  {
    icon: IconCreditCard,
    label: "Payment Method Integration",
    color: "#03A9F4",
  },
  { icon: IconMessages, label: "Reviews", color: "#E91E63" },
  { icon: IconBuilding, label: "Location Groups", color: "#607D8B" },
  { icon: IconDashboard, label: "Location Groups Dashboard", color: "#673AB7" },
  { icon: IconUser, label: "Users", color: "#795548" },
];

export function AdminAppShell() {
  const [navbarCollapsed, { toggle: toggleNavbar }] = useDisclosure();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
        // : { background: "linear-gradient(135deg, #3b3b98, #3cba92)" },
      }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Suspense fallback={<Skeleton height={20} width={200} />}>
            <Image radius="md" h={50} width={300} fit="contain" alt="logo" />
          </Suspense>
        </Group>
      </AppShell.Header>
      <Transition
        mounted={!navbarCollapsed}
        transition="scale-x"
        duration={300}
        timingFunction="ease"
      >
        {(styles) => (
          <AppShell.Navbar p="md">
            <ScrollArea style={{ height: "100%" }}>
              {navLinks.map((link) => (
                <UnstyledButton
                  key={link.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    // color: "#ffffff",
                    marginBottom: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <link.icon
                    size={20}
                    style={{ marginRight: "10px", color: link.color }}
                  />
                  <Text>{link.label}</Text>
                </UnstyledButton>
              ))}
            </ScrollArea>
          </AppShell.Navbar>
        )}
      </Transition>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
