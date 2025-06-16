import "./TagStatus.css";

import { Badge } from "@kobalte/core/badge";
import cx from "classnames";
import { Show } from "solid-js";
import Icon from "../Icon/Icon";

export type MachineStatus = "Online" | "Offline" | "Installed" | "Not Installed";

export interface TagStatusProps {
  status: MachineStatus;
}

export const TagStatus = (props: TagStatusProps) => (
  <Badge class={cx("tag-status", {
    "online": props.status == "Online",
    "offline": props.status == "Offline",
    "installed": props.status == "Installed",
    "not-installed": props.status == "Not Installed",
  })} textValue={props.status}>
    <Show when={props.status == "Not Installed"} fallback={(<div class="indicator"/>)}>
      <Icon icon="Offline" color="primary" inverted={true}/>
    </Show>
  </Badge>
)