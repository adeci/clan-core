import "./Sidebar.css";
import { A } from "@solidjs/router";
import { IconVariant } from "@/src/components/v2/Icon/Icon";
import { SidebarHeader } from "@/src/components/v2/Sidebar/SidebarHeader";

export interface SidebarProps {
  title: string;
  icon: IconVariant;
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <div class="sidebar">
      <SidebarHeader title={props.title} icon={props.icon} />
      <div class="body">
        <A href="/foo">Home</A>
      </div>
    </div>
  );
};
