import "./SidebarAccordion.css";
import { For, JSX } from "solid-js";
import { Accordion } from "@kobalte/core/accordion";
import Icon from "../Icon/Icon";
import { Typography } from "@/src/components/v2/Typography/Typography";

export interface SidebarAccordionItem {
  key: string;
  title: string;
  children: JSX.Element;
}

export interface SidebarAccordionProps {
  items: SidebarAccordionItem[];
}

export const SidebarAccordion = (props: SidebarAccordionProps) => {

  // by default, we expand all items
  const allKeys = props.items.map((item) => item.key);

  return (
    <Accordion class="accordion" collapsible multiple defaultValue={allKeys}>
      <For each={props.items}>
        {(item) => (
          <Accordion.Item class="item" value={item.key}>
            <Accordion.Header class="header">
              <Accordion.Trigger class="trigger">
                <span>{item.title}</span>
                <Icon icon="CaretDown" aria-hidden />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content class="content">
              {item.children}
            </Accordion.Content>
          </Accordion.Item>
        )}
      </For>
    </Accordion>
  );
};
