import "./Sidebar.css";
import { IconVariant } from "@/src/components/v2/Icon/Icon";
import { SidebarHeader } from "@/src/components/v2/Sidebar/SidebarHeader";
import { SidebarBody } from "@/src/components/v2/Sidebar/SidebarBody";
import { RouteDefinition } from "@solidjs/router";

export type AppRoute = Omit<RouteDefinition, "children"> & {
  label: string;
  icon?: IconVariant;
  children?: AppRoute[];
  hidden?: boolean;
};

export interface SidebarProps {
  title: string;
  icon: IconVariant;
  routes: AppRoute;
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <div class="sidebar">
      <SidebarHeader title={props.title} icon={props.icon} />
      <SidebarBody routes={props.routes}/>
    </div>
  );
};
