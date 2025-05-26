import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import Terminal, { TerminalProps } from "./Terminal";

import sample from "./sample";

const meta: Meta<TerminalProps> = {
  title: "Components/Terminal",
  component: Terminal,
};

export default meta;

type Story = StoryObj<TerminalProps>;

export const Default: Story = {
  args: {
    lines: sample.split("\n"),
  },
};
