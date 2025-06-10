import { JSX } from "solid-js";

import "./SidebarAccordion.css";

export interface SidebarAccordionProps {
  children: JSX.Element;
}

export const SidebarAccordion = (props: SidebarAccordionProps) => {
  return (<div class="sidebar-accordion">{props.children}</div>)
}