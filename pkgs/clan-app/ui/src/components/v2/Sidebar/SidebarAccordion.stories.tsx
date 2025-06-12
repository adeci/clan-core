import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import { Loader, LoaderProps } from "@/src/components/v2/Loader/Loader";
import { SidebarAccordion, SidebarAccordionProps } from "./SidebarAccordion";

const meta: Meta<SidebarAccordionProps> = {
  title: "Components/Sidebar/Accordion",
  component: SidebarAccordion,
  decorators: [
    (Story) => (
      <div class="w-40">
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<SidebarAccordionProps>;

export const Default: Story = {
  args: {

  },
};

