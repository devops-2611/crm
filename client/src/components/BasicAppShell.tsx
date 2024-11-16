import {
  AppShell,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Homepage from "../pages/Homepage";
import AppRoutes from "../routes/Routes";
import { useState } from "react";
import { Notifications } from "@mantine/notifications";
export function BasicAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const [navbarCollapsed, { toggle: toggleNavbar }] = useDisclosure();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); // Track expanded submenu
  const location = useLocation(); // To get the current route
  const navLinks = [
    { label: "Dashboard", path: "/" },
    {
      label: "Invoices",
      path: "/Invoices",
      submenu: [
        { label: "View Invoice", path: "/reports/viewinvoice" },
        { label: "Generate Invoice", path: "/reports/generate" },
      ],
    },
  ];
  const handleSubmenuToggle = (label: string) => {
    console.log(label, "label")
    setExpandedMenu((prev) => (prev === label ? null : label));
  };
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <MantineLogo size={30} />
           */}
          <div>Some logo here</div>
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
            {/* Menu Items */}
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                component={link.submenu ? undefined : Link}
                to={link.submenu ? undefined : link.path}
                label={link.label}
                active={
                  location.pathname === link.path ||
                  link.submenu?.some((sub) => location.pathname === sub.path)
                } // Highlight parent if active
                rightSection={
                  link.submenu ? (
                    <Button
                      size="xs"
                      variant="outline"
                      // compact
                      
                      onClick={() => handleSubmenuToggle(link.label)}
                    >
                      {expandedMenu === link.label ? "−" : "+"}
                    </Button>
                  ) : null
                }
                onClick={() => link.submenu && handleSubmenuToggle(link.label)}
                styles={(theme) => ({
                  root: {
                    borderRadius: theme.radius.sm,
                    backgroundColor:
                      location.pathname === link.path ||
                      link.submenu?.some(
                        (sub) => location.pathname === sub.path
                      )
                        ? theme.colors.blue[0]
                        : "transparent",
                    color:
                      location.pathname === link.path ||
                      link.submenu?.some(
                        (sub) => location.pathname === sub.path
                      )
                        ? theme.colors.blue[7]
                        : theme.colors.dark[7],
                    fontWeight:
                      location.pathname === link.path ||
                      link.submenu?.some(
                        (sub) => location.pathname === sub.path
                      )
                        ? 700
                        : 500,
                  },
                })}
              >
                {/* Render Submenu Items */}
                {link.submenu &&
                  // expandedMenu === link.label && todo
                  link.submenu.map((subLink) => (
                    <NavLink
                      key={subLink.path}
                      component={Link}
                      to={subLink.path}
                      label={subLink.label}
                      active={location.pathname === subLink.path}
                      styles={(theme) => ({
                        root: {
                          marginLeft: theme.spacing.md,
                          borderRadius: theme.radius.sm,
                          backgroundColor:
                            location.pathname === subLink.path
                              ? theme.colors.blue[1]
                              : "transparent",
                          color:
                            location.pathname === subLink.path
                              ? theme.colors.blue[7]
                              : theme.colors.dark[6],
                          fontWeight:
                            location.pathname === subLink.path ? 600 : 400,
                        },
                      })}
                    />
                  ))}
              </NavLink>
            ))}
          </AppShell.Navbar>
        )}
      </Transition>

      <AppShell.Main>
        <AppRoutes />
      </AppShell.Main>
    </AppShell>
  );
}
