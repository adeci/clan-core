import "./SidebarBody.css";
import { A } from "@solidjs/router";
import { Accordion } from "@kobalte/core/accordion";
import Icon from "../Icon/Icon";
import { Typography } from "@/src/components/v2/Typography/Typography";

export interface SidebarBodyProps {}

export const SidebarBody = (props: SidebarBodyProps) => {
  return (
    <div class="sidebar-body">
      <nav>
        <Accordion class="accordion" multiple>
          <Accordion.Item class="item" value="foo">
            <Accordion.Header class="header">
              <Accordion.Trigger class="trigger">
                <Typography
                  hierarchy="label"
                  family="mono"
                  size="xs"
                  inverted={true}
                  color="tertiary"
                >
                  YOUR MACHINES
                </Typography>
                <Icon icon="CaretDown" inverted={true} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content class="content">
              <nav>
                <A href="/foo">
                  <Typography
                    hierarchy="body"
                    size="xs"
                    weight="bold"
                    color="primary"
                    inverted={true}
                  >
                    Foo
                  </Typography>
                </A>
                <A href="/foo">
                  <Typography
                    hierarchy="body"
                    size="xs"
                    weight="bold"
                    color="primary"
                    inverted={true}
                  >
                    Bar
                  </Typography>
                </A>
                <A href="/foo">
                  <Typography
                    hierarchy="body"
                    size="xs"
                    weight="bold"
                    color="primary"
                    inverted={true}
                  >
                    Baz
                  </Typography>
                </A>
              </nav>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item class="item" value="bar">
            <Accordion.Header class="header">
              <Accordion.Trigger class="trigger">
                <Typography
                  hierarchy="label"
                  family="mono"
                  size="xs"
                  inverted={true}
                  color="tertiary"
                >
                  TOOLS
                </Typography>
                <Icon icon="CaretDown" inverted={true} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content class="content">
              <nav>
                <A href="/foo">
                  <Typography
                    hierarchy="body"
                    size="xs"
                    weight="bold"
                    color="primary"
                    inverted={true}
                  >
                    Foo
                  </Typography>
                </A>
                <A href="/foo">
                  <Typography
                    hierarchy="body"
                    size="xs"
                    weight="bold"
                    color="primary"
                    inverted={true}
                  >
                    Bar
                  </Typography>
                </A>
                <A href="/foo">
                  <Typography
                    hierarchy="body"
                    size="xs"
                    weight="bold"
                    color="primary"
                    inverted={true}
                  >
                    Baz
                  </Typography>
                </A>
              </nav>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </nav>
    </div>
  );
};
