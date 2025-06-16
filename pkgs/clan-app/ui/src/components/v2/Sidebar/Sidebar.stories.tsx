import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import {
  createMemoryHistory,
  MemoryRouter,
  Route,
  RouteSectionProps,
} from "@solidjs/router";
import { Sidebar, SectionProps, RouteProps } from "@/src/components/v2/Sidebar/Sidebar";
import { Suspense } from "solid-js";
import { Typography } from "../Typography/Typography";
import Icon from "../Icon/Icon";

const MachineRoute = (props: RouteProps) => (
  <div class="flex w-full flex-col gap-2">
    <div class="flex flex-row items-center justify-between">
      <Typography hierarchy="body" size="xs" weight="bold" color="primary" inverted={true}>
        {props.label}
      </Typography>
      <span class="flex size-1 items-center justify-center rounded-full bg-emerald-400"/>
    </div>
    <div class="flex w-full flex-row items-center gap-1">
      <Icon icon="Flash" size="0.75rem" inverted={true} color="tertiary"/>
      <Typography hierarchy="label" family="mono" size="s" inverted={true} color="primary">0</Typography>
    </div>
  </div>
)

const routes: SectionProps[] = [
  {
    label: "My Machines",
    component: MachineRoute,
    routes: [
      { label: "Neptune", path: "/machines/neptune" },
      { label: "Pandora", path: "/machines/pandora" },
      { label: "Saturn", path: "/machines/saturn" },
    ],
  },
  {
    label: "Tools",
    routes: [
      { label: "Builder", path: "/tools/builder" },
      { label: "Editor", path: "/tools/editor" },
      { label: "Viewer", path: "/tools/viewer" },
    ]
  }
]

const meta: Meta<RouteSectionProps> = {
  title: "Components/Sidebar",
  component: Sidebar,
  render: (_, context) => {
    const history = createMemoryHistory();
    history.set({ value: "/machines/pandora" });

    return (
      <div class="h-screen">
        <MemoryRouter
          history={history}
          root={(props) => <Suspense>{props.children}</Suspense>}

        >
          <Route
            path="/machines/pandora"
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
