import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import {
  createMemoryHistory,
  MemoryRouter,
  Route,
  RouteSectionProps,
} from "@solidjs/router";
import { Sidebar } from "@/src/components/v2/Sidebar/Sidebar";
import { Suspense } from "solid-js";

const meta: Meta<RouteSectionProps> = {
  title: "Components/Sidebar",
  component: Sidebar,
  render: (_, context) => {
    const history = createMemoryHistory();
    history.set({ value: "/foo" });

    return (
      <MemoryRouter
        history={history}
        root={(props) => <Suspense>{props.children}</Suspense>}
      >
        <Route
          path="/foo"
          component={(props) => <Sidebar title="My Clan" icon="ClanIcon" />}
        />
      </MemoryRouter>
    );
  },
};

export default meta;

type Story = StoryObj<RouteSectionProps>;

export const Default: Story = {
  args: {},
};
