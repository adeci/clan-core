import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import { Sidebar, SidebarProps } from "@/src/components/v2/Sidebar/Sidebar";
import { SidebarHeader } from "@/src/components/v2/Sidebar/SidebarHeader";

const meta: Meta<SidebarProps> = {
  title: "Components/Sidebar",
  component: Sidebar,
  decorators: [
    (Story) => (
      <div class="max-w-96">
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<SidebarProps>;

export const Default: Story = {
  args: {
    children: <SidebarHeader title="Sidebar" />,
  }
};
