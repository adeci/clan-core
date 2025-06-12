import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import { Loader, LoaderProps } from "@/src/components/v2/Loader/Loader";
import { SidebarAccordion, SidebarAccordionProps } from "./SidebarAccordion";
import { SidebarList, SidebarListItem } from "@/src/components/v2/Sidebar/SidebarList";

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
        children: <SidebarList>
          <SidebarListItem title="Neptune" />
          <SidebarListItem title="Saturn" />
          <SidebarListItem title="Pandora" />
        </SidebarList>
      },
      {
        key: "tools",
        title: "Tools",
        children: <SidebarList>
          <SidebarListItem title="Backup & Home" />
          <SidebarListItem title="Raspberry Pi" />
          <SidebarListItem title="Mom's Laptop" />
          <SidebarListItem title="Dad's Laptop" />
        </SidebarList>
      },
    ]
  },
};

