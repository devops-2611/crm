import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  NavLink,
  Transition,
  Image
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import AppRoutes from "../routes/Routes";
import { useState } from "react";
import { IconChevronUp } from "@tabler/icons-react";
import { IconChevronDown } from "@tabler/icons-react";
import { IconEye } from "@tabler/icons-react";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { IconFileInvoice } from "@tabler/icons-react";
import { IconFilePlus } from "@tabler/icons-react";
export function BasicAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const [navbarCollapsed, { toggle: toggleNavbar }] = useDisclosure();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); // Track expanded submenu
  const location = useLocation(); // To get the current route
  const navLinks = [
    {
      label: "Dashboard",
      path: "/",
      logo: <IconLayoutDashboard style={{ color: "#007BFF" }} stroke={2} />,
    },
    {
      label: "Invoices",
      path: "/Invoices",
      logo: <IconFileInvoice style={{ color: "#20B2AA" }} />,
      submenu: [
        {
          label: "View Invoice",
          path: "/reports/viewinvoice",
          logo: <IconEye style={{ color: "#28A745" }} />,
        },
        {
          label: "Generate Invoice",
          path: "/reports/generate",
          logo: <IconFilePlus style={{ color: "#FF7F50" }} />,
        },
      ],
    },
  ];

  const handleSubmenuToggle = (label: string) => {
    console.log(label, "label");
    setExpandedMenu((prev) => (prev === label ? null : label));
  };
  // const logoUrl = `${import.meta.env.VITE_API_BASE_URL}${
  //   customerConfig?.logoImg
  // }`;
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
          <div>
          {/* <Image
      radius="md"
      h={200}
      w="auto"
      fit="contain"
      src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-9.png"
    /> */}

          </div>
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
                to={link.submenu ? link.submenu[0]?.path : link.path}
                label={link.label}
                active={
                  location.pathname === link.path ||
                  link.submenu?.some((sub) => location.pathname === sub.path)
                } // Highlight parent if active
                leftSection={link.logo}
                rightSection={
                  link.submenu ? (
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      onClick={() => handleSubmenuToggle(link.label)}
                    >
                      {expandedMenu === link.label ? (
                        <IconChevronDown size={12} stroke={2} />
                      ) : (
                        <IconChevronUp size={12} stroke={2} />
                      )}
                    </ActionIcon>
                  ) : null
                }
                onClick={() => link.submenu && handleSubmenuToggle(link.label)}
                styles={(theme) => ({
                  root: {
                    borderRadius: theme.radius.sm,
                    // backgroundColor:
                    //   location.pathname === link.path ||
                    //   link.submenu?.some(
                    //     (sub) => location.pathname === sub.path
                    //   )
                    //     ? theme.colors.cyan[0]
                    //     : "transparent",

                    color:
                      location.pathname === link.path ||
                      link.submenu?.some(
                        (sub) => location.pathname === sub.path
                      )
                        ? theme.colors.blue[7]
                        : theme.colors.dark[7],
                    // fontWeight:
                    //   location.pathname === link.path ||
                    //   link.submenu?.some(
                    //     (sub) => location.pathname === sub.path
                    //   )
                    //     ? 700
                    //     : 500,
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
                      leftSection={subLink.logo}
                      styles={(theme) => ({
                        root: {
                          // marginLeft: theme.spacing.md,
                          borderRadius: theme.radius.sm,
                          // backgroundColor:
                          //   location.pathname === subLink.path
                          //     ? theme.colors.blue[1]
                          //     : "transparent",
                          color:
                            location.pathname === subLink.path
                              ? theme.colors.blue[7]
                              : theme.colors.dark[6],
                          // fontWeight:
                          //   location.pathname === subLink.path ? 600 : 400,
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
