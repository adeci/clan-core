import "./SidebarBody.css"
import { A } from "@solidjs/router";

export interface SidebarBodyProps {

}

export const SidebarBody = (props: SidebarBodyProps) => {

  return (
    <div class="sidebar-body">
      <A href="/foo">Home</A>
    </div>
  )
}
