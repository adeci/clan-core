import "./SidebarNav.css";
import { SidebarNavHeader } from "@/src/components/v2/Sidebar/SidebarNavHeader";
import { SidebarNavBody } from "@/src/components/v2/Sidebar/SidebarNavBody";
import { MachineStatus } from "@/src/components/v2/Sidebar/TagStatus";

export interface LinkProps {
  path: string;
  label?: string;
}

export interface SectionProps {
  label: string;
  links: LinkProps[];
}

export interface MachineProps {
  label: string;
  path: string;
  status: MachineStatus;
  serviceCount: number;
}

export interface ClanProps {
  label: string;
  machines: MachineProps[];
}

export interface SidebarNavProps {
  clanDetail: ClanProps;
  extraSections: SectionProps[];
}

export const SidebarNav = (props: SidebarNavProps) => {
  return (
    <div class="sidebar">
      <SidebarNavHeader {...props} />
      <SidebarNavBody {...props} />
    </div>
  );
};
