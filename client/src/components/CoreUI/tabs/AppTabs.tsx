import { useState } from "react";
import { FloatingIndicator, rem, Tabs, useMantineTheme } from "@mantine/core";
import type { TabsProps } from "@mantine/core";
import classes from "./APPTabs.module.css";
export interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface APPTabsProps extends Omit<TabsProps, "children"> {
  tabs: TabItem[];
}

export function APPTabs({ tabs, ...props }: APPTabsProps) {
  const [value, setValue] = useState<string | null>("1");
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };
  const theme = useMantineTheme();

  return (
    <Tabs value={value} onChange={setValue} {...props}>
      <Tabs.List className={classes.list} grow flex={"flex-start"}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            ref={setControlRef(tab.value)}
            className={classes.tab}
            styles={{ tabLabel: { fontSize: rem(16) } }}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
