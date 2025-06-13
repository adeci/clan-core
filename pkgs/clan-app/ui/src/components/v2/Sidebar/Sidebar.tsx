import "./Sidebar.css";
import { IconVariant } from "@/src/components/v2/Icon/Icon";
import { SidebarHeader } from "@/src/components/v2/Sidebar/SidebarHeader";
import { SidebarBody } from "@/src/components/v2/Sidebar/SidebarBody";

export interface SidebarProps {
  title: string;
  icon: IconVariant;
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <div class="sidebar">
      <SidebarHeader title={props.title} icon={props.icon} />
      <SidebarBody />
    </div>
  );
};
