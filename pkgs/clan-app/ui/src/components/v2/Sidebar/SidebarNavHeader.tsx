import "./SidebarNavHeader.css";
import Icon, { IconVariant } from "@/src/components/v2/Icon/Icon";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { useNavigate } from "@solidjs/router";
import { Typography } from "../Typography/Typography";
import { createSignal } from "solid-js";

export interface SidebarHeaderProps {
  title: string;
}

export const SidebarNavHeader = (props: SidebarHeaderProps) => {
  const navigate = useNavigate();

  const [open, setOpen] = createSignal(false);

  return (
    <div class="sidebar-header">
      <DropdownMenu open={open()} onOpenChange={setOpen} sameWidth={true}>
        <DropdownMenu.Trigger class="dropdown-trigger">
            <div class="title">

              <Typography
                hierarchy="body"
                size="default"
                weight="bold"
                color="primary"
                inverted={!open()}
              >
                {props.title}
              </Typography>
            </div>
            <DropdownMenu.Icon>
              <Icon icon={"CaretDown"} inverted={!open()} size="0.75rem" />
            </DropdownMenu.Icon>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="sidebar-dropdown-content">
            <DropdownMenu.Item onSelect={() => navigate("/foo")}>
              Hello world
            </DropdownMenu.Item>
            <DropdownMenu.Item>Foo bar</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </div>
  );
};
