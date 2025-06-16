import "./Sidebar.css";
import { IconVariant } from "@/src/components/v2/Icon/Icon";
import { SidebarHeader } from "@/src/components/v2/Sidebar/SidebarHeader";
import { SidebarBody } from "@/src/components/v2/Sidebar/SidebarBody";
import { Component } from "solid-js";

export interface RouteProps {
  path: string;
  label?: string;
}

export interface SectionProps {
  label: string;
  routes: RouteProps[];
  component?: Component<RouteProps>;
}

export interface SidebarProps {
  title: string;
  icon: IconVariant;
  routes: SectionProps[];
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <div class="sidebar">
      <SidebarHeader title={props.title} icon={props.icon} />
      <SidebarBody routes={props.routes} />
    </div>
  );
};
