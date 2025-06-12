import { A } from "@solidjs/router";

import "./SidebarAccordion.css";
import { JSX } from "solid-js";

export interface SidebarAccordionProps {
  children: JSX.Element;
}

export const SidebarAccordion = (props: SidebarAccordionProps) => {
  return (
    <li class="sidebar-list-item">
      {props.children}
    </li>
  );
};
