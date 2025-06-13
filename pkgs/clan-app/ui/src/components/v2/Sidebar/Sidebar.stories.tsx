import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import {
  createMemoryHistory,
  MemoryRouter,
  Route,
  RouteSectionProps,
} from "@solidjs/router";
import { AppRoute, Sidebar } from "@/src/components/v2/Sidebar/Sidebar";
import { Suspense } from "solid-js";

const routes: AppRoute = {
  label: "My Clan",
  icon: "ClanIcon",
  children: [
    {
      label: "My Machines",
      children: [
        { label: "Neptune", path: "/machines/neptune" },
        { label: "Pandora", path: "/machines/pandora" },
        { label: "Saturn", path: "/machines/saturn" },
      ],
    },
    {
      label: "Tools",
      children: [
        { label: "Builder", path: "/tools/builder" },
        { label: "Editor", path: "/tools/editor" },
        { label: "Viewer", path: "/tools/viewer" },
      ]
    }
  ],
};

const meta: Meta<RouteSectionProps> = {
  title: "Components/Sidebar",
  component: Sidebar,
  render: (_, context) => {
    const history = createMemoryHistory();
    history.set({ value: "/foo" });

    return (
      <div class="h-screen">
        <MemoryRouter
          history={history}
          root={(props) => <Suspense>{props.children}</Suspense>}
        >
          <Route
            path="/foo"
            component={(props) => (
              <Sidebar title="My Clan" icon="ClanIcon" routes={routes} />
            )}
          />
        </MemoryRouter>
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<RouteSectionProps>;

export const Default: Story = {
  args: {},
};
