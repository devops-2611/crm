import {
  Group,
  ScrollArea,
  AppShell,
  Transition,
  Burger,
  Image,
  Skeleton,
  useMantineTheme,
  NavLink,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMap,
  IconChartLine,
  IconShoppingCart,
  IconDiscount2,
  IconBriefcase,
  IconCreditCard,
  IconMessages,
  IconBuilding,
  IconDashboard,
  IconUser,
  IconAffiliate,
  IconBell,
  IconCar,
  IconChartBar,
  IconCrown,
  IconDiscount,
  IconExchange,
  IconFileInvoice,
  IconInbox,
  IconLayout,
  IconList,
  IconMail,
  IconMailFast,
  IconMessage,
  IconMessageCircle,
  IconPercentage,
  IconSettings,
  IconStar,
  IconTruck,
  IconTruckDelivery,
  IconUserCircle,
  IconWallet,
  IconPhone,
} from "@tabler/icons-react";
import { Suspense, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const navLinks = [
  {
    label: "Dashboard",
    icon: IconDashboard, // General dashboard icon
    path: "admin/dashboard",
  },
  {
    label: "Partners & Customers",
    icon: IconBuilding, // Represents organizations or partnerships
    path: "admin/partners-and-customers",
    submenu: [
      {
        label: "Businesses",
        icon: IconBriefcase,
        path: "admin/partners-and-customers/businesses",
      },
      {
        label: "Customers",
        icon: IconUser,
        path: "admin/partners-and-customers/customers",
      },
      {
        label: "Orders",
        icon: IconShoppingCart,
        path: "admin/partners-and-customers/orders",
      },
      {
        label: "Analytics",
        icon: IconChartLine,
        path: "admin/partners-and-customers/analytics",
      },
      {
        label: "Zones",
        icon: IconMap,
        path: "admin/partners-and-customers/zones",
      },
    ],
  },
  {
    label: "Swishr Courier",
    icon: IconTruck, // Represents courier services
    path: "admin/swishr-courier",
    submenu: [
      {
        label: "Orders",
        icon: IconShoppingCart,
        path: "swishr-courier/orders",
      },
      {
        label: "Analytics",
        icon: IconChartBar,
        path: "swishr-courier/analytics",
      },
      {
        label: "Customers",
        icon: IconUser,
        path: "swishr-courier/customers",
      },
      { label: "Drivers", icon: IconCar, path: "swishr-courier/drivers" },
      {
        label: "List of Drivers",
        icon: IconList,
        path: "swishr-courier/drivers-list",
      },
      {
        label: "Promotions",
        icon: IconDiscount,
        path: "swishr-courier/promotions",
      },
      { label: "Zones", icon: IconMap, path: "wishr-courier/zones" },
    ],
  },
  {
    label: "Settings",
    icon: IconSettings, // General settings icon
    path: "admin/settings",
    submenu: [
      {
        label: "Users & Roles",
        icon: IconUserCircle,
        path: "admin/settings/users-roles",
      },
    ],
  },
  {
    label: "Accounting",
    icon: IconCreditCard, // Represents financial settings
    path: "admin/accounting",
    submenu: [
      {
        label: "Transactions",
        icon: IconExchange,
        path: "admin/accounting/transactions",
      },
      {
        label: "Invoices",
        icon: IconFileInvoice,
        path: "admin/accounting/invoices",
      },
      {
        label: "Invoice Settings",
        icon: IconSettings,
        path: "admin/accounting/invoice-settings",
      },
      {
        label: "Business Payouts",
        icon: IconWallet,
        path: "admin/accounting/business-payouts",
      },
      {
        label: "Driver Payouts",
        icon: IconTruckDelivery,
        path: "admin/accounting/driver-payouts",
      },
    ],
  },
  {
    label: "Communications",
    icon: IconMessages, // Represents communication tools
    path: "admin/communications",
    submenu: [
      {
        label: "Push Notifications",
        icon: IconBell,
        path: "admin/communications/push-notifications",
      },
      {
        label: "In-App Messages",
        icon: IconMessageCircle,
        path: "admin/communications/in-app-messages",
      },
      {
        label: "Messages Box",
        icon: IconInbox,
        path: "admin/communications/messages-box",
      },
      { label: "E-Mails", icon: IconMail, path: "admin/communications/emails" },
      { label: "SMS", icon: IconMessage, path: "admin/communications/sms" },
    ],
  },
  {
    label: "Marketing & Promotions",
    icon: IconPhone, // Represents marketing campaigns
    path: "admin/marketing-and-promotions",
    submenu: [
      {
        label: "Promotional Emails",
        icon: IconMailFast,
        path: "admin/marketing-and-promotions/promotional-emails",
      },
      {
        label: "Promo Code",
        icon: IconDiscount2,
        path: "admin/marketing-and-promotions/promo-code",
      },
      {
        label: "Order Discounts",
        icon: IconPercentage,
        path: "admin/marketing-and-promotions/order-discounts",
      },
      {
        label: "Account Level Discounts",
        icon: IconWallet,
        path: "admin/marketing-and-promotions/account-discounts",
      },
      {
        label: "VIP Discounts",
        icon: IconCrown,
        path: "admin/marketing-and-promotions/vip-discounts",
      },
      {
        label: "Loyalty Program",
        icon: IconStar,
        path: "admin/marketing-and-promotions/loyalty-program",
      },
    ],
  },
  {
    label: "Affiliates",
    icon: IconAffiliate, // Represents affiliate management
    path: "admin/affiliates",
    submenu: [
      {
        label: "Dashboard",
        icon: IconDashboard,
        path: "admin/affiliates/dashboard",
      },
      {
        label: "List of Affiliates",
        icon: IconList,
        path: "admin/affiliates/list-of-affiliates",
      },
      {
        label: "Users & Roles",
        icon: IconUser,
        path: "admin/affiliates/users-roles",
      },
    ],
  },
  {
    label: "Admin Panel Settings",
    icon: IconSettings, // General admin settings
    path: "admin/admin-panel-settings",
    submenu: [
      {
        label: "Layout Settings",
        icon: IconLayout,
        path: "admin/admin-panel-settings/layout-settings",
      },
      {
        label: "Invoice Settings",
        icon: IconFileInvoice,
        path: "admin/admin-panel-settings/invoice-settings",
      },
      {
        label: "Users & Roles",
        icon: IconUserCircle,
        path: "admin/admin-panel-settings/users-roles",
      },
    ],
  },
];

export function AdminAppShell() {
  const [navbarCollapsed, { toggle: toggleNavbar }] = useDisclosure();
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure();

  const [activeLink, setActiveLink] = useState(null);
  const isRouteActive = (route: string) => location.pathname.includes(route);
  const theme = useMantineTheme();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Suspense fallback={<Skeleton height={20} width={200} />}>
            <Image radius="md" h={50} width={300} fit="contain" alt="logo" />
          </Suspense>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <Transition
        mounted={!navbarCollapsed}
        transition="scale-x"
        duration={300}
        timingFunction="ease"
      >
        {(styles) => (
          <AppShell.Navbar p="sm">
            <AppShell.Section>
            <Button style={{background:theme.colors.gray[7]}} fullWidth >
                {" "}
                Admin Panel
              </Button>
            </AppShell.Section>
            <AppShell.Section
              grow
              my="md"
              component={ScrollArea}
              scrollbarSize={5}
            >
              <ScrollArea>
                {navLinks?.map((navItem) => (
                  <NavLink
                    label={navItem.label}
                    leftSection={
                      <navItem.icon
                        size="1rem"
                        stroke={1.5}
                        style={{
                          color: isRouteActive(navItem.path)
                            ? theme.colors.green[7]
                            : theme.colors.gray[7],
                        }}
                      />
                    }
                    childrenOffset={28}
                    // to={navItem.path}
                    // component={'a'}
                    key={navItem.label}
                    styles={{
                      label: {
                        color: isRouteActive(navItem.path)
                          ? theme.colors.green[7]
                          : theme.colors.gray[7],
                        fontWeight: isRouteActive(navItem.path)
                          ? "600"
                          : "normal"
                      },
                      root: { borderRadius: "10px",
             },
                      children: { paddingLeft: "15px" },
                    }}
                    bg={
                      isRouteActive(navItem.path)
                        ? theme.colors.green[0]
                        : undefined
                    }
                  >
                    {navItem?.submenu?.map((subNavItem) => (
                      <NavLink
                        component={Link}
                        to={subNavItem.path}
                        label={subNavItem.label}
                        key={subNavItem.label}
                        styles={{
                          label: {
                            color: isRouteActive(subNavItem.path)
                              ? theme.colors.green[7]
                              : theme.colors.gray[7],
                            fontWeight: isRouteActive(subNavItem.path)
                              ? "600"
                              : "normal",
                          },
                          root: { borderRadius: "5px" },
                        }}
                        leftSection={
                          <subNavItem.icon
                            size="1rem"
                            stroke={1.5}
                            style={{
                              color: isRouteActive(subNavItem.path)
                                ? theme.colors.green[7]
                                : theme.colors.gray[7],
                            }}
                          />
                        }
                      />
                    ))}
                  </NavLink>
                ))}
              </ScrollArea>
            </AppShell.Section>
            <AppShell.Section>
              <Button style={{background:theme.colors.gray[7]}}>
                {" "}
                Go Back
              </Button>
            </AppShell.Section>
          </AppShell.Navbar>
        )}
      </Transition>

      {/* Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
