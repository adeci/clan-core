import "./SidebarHeader.css";
import Icon, { IconVariant } from "@/src/components/v2/Icon/Icon";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { useNavigate } from "@solidjs/router";
import { Typography } from "../Typography/Typography";

export interface SidebarHeaderProps {
  title: string;
  icon: IconVariant;
}

export const SidebarHeader = (props: SidebarHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div class="sidebar-header">
    <DropdownMenu>
      <DropdownMenu.Trigger class="trigger">
        <div class="title">
          <Icon icon="ClanIcon" inverted={true} />
           <Typography
             hierarchy="body"
             size="s"
             weight="bold"
             color="primary"
             inverted={true}
           >
          My Clan
        </Typography>
        </div>

        <DropdownMenu.Icon>
          <Icon icon={"CaretDown"} inverted={true} />
        </DropdownMenu.Icon>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => navigate("/foo")}>
            Hello world
          </DropdownMenu.Item>
          <DropdownMenu.Item>Foo bar</DropdownMenu.Item>

          <DropdownMenu.Arrow />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
    </div>
  );
};
