import "./SidebarList.css";
import { A } from "@solidjs/router";
import { Typography } from "@/src/components/v2/Typography/Typography";
import { For, JSX } from "solid-js";

export interface SidebarListItemProps {
  href: string;
  title: string;
}

export const SidebarListItem = (props: SidebarListItemProps) => {
  return (
    <li>
      <A href={props.href || "/"}>
        <Typography hierarchy="label" size="xs" color="primary" inverted={true}>
          {props.title}
        </Typography>
      </A>
    </li>
  );
};

export interface SidebarListProps {
  children: JSX.Element;
}

export const SidebarList = (props: SidebarListProps) => {
  return <ul class="sidebar-list">{props.children}</ul>;
};
