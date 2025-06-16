import { TagStatus, TagStatusProps } from "@/src/components/v2/Sidebar/TagStatus";
import { Meta, StoryObj } from "@kachurun/storybook-solid";


const meta: Meta<TagStatusProps> = {
    title: "Components/Sidebar/TagStatus",
    component: TagStatus,
    decorators: [
      (Story: StoryObj) => (
        <div class="bg-inv-1 p-5">
          <Story/>
        </div>
      )
    ]
};

export default meta;

type Story = StoryObj<TagStatusProps>;

export const Online: Story = {
  args: {
    status: "Online"
  }
}

export const Offline: Story = {
  args: {
    status: "Offline"
  }
}

export const Installed: Story = {
  args: {
    status: "Installed"
  }
}

export const NotInstalled: Story = {
  args: {
    status: "Not Installed"
  }
}