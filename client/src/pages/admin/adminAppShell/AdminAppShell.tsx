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
import { Suspense } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { navLinks } from "./AadminNavlinks";
import Static_Logo from "../../../assets/Static_Logo.jpeg";

export function AdminAppShell() {
  const [navbarCollapsed, { toggle: toggleNavbar }] = useDisclosure();
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure();
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
            <Image
              radius="md"
              h={50}
              width={300}
              fit="contain"
              alt="logo"
              src={Static_Logo}
            />
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
          <AppShell.Navbar p="sm" pr={0}>
            <AppShell.Section mr={"sm"}>
              <Button style={{ background: theme.colors.gray[7] }} fullWidth>
                {" "}
                Admin Panel
              </Button>
            </AppShell.Section>
            <AppShell.Section grow my="md" component={ScrollArea}>
              <ScrollArea scrollbarSize={1}>
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
                          : "normal",
                      },
                      root: { borderRadius: "10px" },
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
              <Button style={{ background: theme.colors.gray[7] }}>
                Go Back
              </Button>
            </AppShell.Section>
          </AppShell.Navbar>
        )}
      </Transition>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
