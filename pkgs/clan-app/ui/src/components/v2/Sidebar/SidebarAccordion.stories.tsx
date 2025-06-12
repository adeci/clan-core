import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import { SidebarAccordion, SidebarAccordionProps } from "./SidebarAccordion";
import {
  SidebarList,
  SidebarListItem,
} from "@/src/components/v2/Sidebar/SidebarList";
import { Route } from "@solidjs/router";
import { render } from "@solidjs/testing-library";

const meta: Meta<SidebarAccordionProps> = {
  title: "Components/Sidebar/Accordion",
  component: SidebarAccordion,
};

export default meta;

type Story = StoryObj<SidebarAccordionProps>;

export const Default: Story = {
  args: {
    items: [
      {
        key: "machines",
        title: "Your Machines",
        children: (
          <SidebarList>
            <SidebarListItem title="Neptune" href="/" />
            <SidebarListItem title="Saturn" href="/" />
            <SidebarListItem title="Pandora" href="/" />
          </SidebarList>
        ),
      },
      {
        key: "tools",
        title: "Tools",
        children: (
          <SidebarList>
            <SidebarListItem title="Backup & Home" href="/" />
            <SidebarListItem title="Raspberry Pi" href="/" />
            <SidebarListItem title="Mom's Laptop" href="/" />
            <SidebarListItem title="Dad's Laptop" href="/" />
          </SidebarList>
        ),
      },
    ],
  },
  decorators: [
    (Story) =>
      render(() => <Route path="/foo" component={Story} />, {
        location: "/foo",
      }),
  ],
};
