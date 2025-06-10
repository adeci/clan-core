import "./SidebarHeader.css"
import { createSignal, Show } from "solid-js";
import Icon from "@/src/components/icon";
import { Typography } from "@/src/components/Typography";

export interface SidebarHeaderProps {
  title: string;
}

export const SidebarHeader = (props: SidebarHeaderProps) => {
  const [showFlyout, toggleFlyout] = createSignal(false);

  function handleClick() {
    toggleFlyout(!showFlyout());
  }

  return (
    <div class="sidebar-header">
      <div class="inner" onClick={handleClick}>
          <Typography
            tag="h3"
            class="title"
            hierarchy="body"
            size="default"
            weight="medium"
            color="primary"
            inverted={true}
          >
            {props.title}
          </Typography>
        <Show
          when={showFlyout}
          fallback={<Icon size={12} class="text-white" icon="CaretDown" />}
        >
          <Icon size={12} class="text-white" icon="CaretDown" />
        </Show>
      </div>
      {/*{showFlyout() && <SidebarFlyout />}*/}
    </div>
  )
}