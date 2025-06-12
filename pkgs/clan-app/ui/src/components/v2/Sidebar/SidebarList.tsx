import "./SidebarList.css";
import { Typography } from "@/src/components/v2/Typography/Typography";
import { For, JSX } from "solid-js";

export interface SidebarListItemProps {
  title: string;
}

export const SidebarListItem = (props: SidebarListItemProps) => {
  return (
    <li>
      <Typography hierarchy="label" size="xs" color="primary" inverted={true}>
        {props.title}
      </Typography>
    </li>
  );
};

export interface SidebarListProps {
  children: JSX.Element;
}

export const SidebarList = (props: SidebarListProps) => {
  return (
    <ul class="sidebar-list">
      {props.children}
    </ul>
  );
};
