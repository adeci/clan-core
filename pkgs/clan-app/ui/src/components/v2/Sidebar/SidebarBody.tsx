import "./SidebarBody.css";
import { A, RouteProps } from "@solidjs/router";
import { Accordion } from "@kobalte/core/accordion";
import Icon from "../Icon/Icon";
import { Typography } from "@/src/components/v2/Typography/Typography";
import { AppRoute } from "@/src/components/v2/Sidebar/Sidebar";
import { For, Index } from "solid-js";

export interface SidebarBodyProps {
  routes: AppRoute;
}

export const SidebarBody = (props: SidebarBodyProps) => {

  const sections = props.routes.children || [];

  const sectionLabels = sections.map(section => section.label);


  return (
    <div class="sidebar-body">
      <For each={sections}>
        {(section) => (
          <Accordion class="accordion" multiple defaultValue={sectionLabels}>
            <Accordion.Item class="item" value={section.label}>
              <Accordion.Header class="header">
                <Accordion.Trigger class="trigger">
                  <Typography
                    hierarchy="label"
                    family="mono"
                    size="xs"
                    inverted={true}
                    color="tertiary"
                  >
                    {section.label}
                  </Typography>
                  <Icon icon="CaretDown" color="tertiary" inverted={true} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content class="content">
                <nav>
                  <For each={section.children || []}>
                    {(route) => (
                      <A href={route.path}>
                        <Typography
                          hierarchy="body"
                          size="xs"
                          weight="bold"
                          color="primary"
                          inverted={true}
                        >
                          {route.label}
                        </Typography>
                      </A>
                    )}
                  </For>
                </nav>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        )}
      </For>
    </div>
  );
};
