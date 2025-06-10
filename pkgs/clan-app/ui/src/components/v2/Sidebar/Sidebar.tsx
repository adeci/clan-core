import "./Sidebar.css";
import { JSX } from "solid-js";

export interface SidebarProps {
  children: JSX.Element;
}

export const Sidebar = (props: SidebarProps) => {
  return (<aside class="sidebar">{props.children}</aside>);
};
