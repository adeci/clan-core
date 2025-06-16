import type { Meta, StoryObj } from "@kachurun/storybook-solid";
import {
  createMemoryHistory,
  MemoryRouter,
  Route,
  RouteSectionProps,
} from "@solidjs/router";
import {
  SidebarNav,
  SectionProps,
  LinkProps,
  ClanProps,
  SidebarNavProps,
} from "@/src/components/v2/Sidebar/SidebarNav";
import { Suspense } from "solid-js";
import { Typography } from "../Typography/Typography";
import Icon from "../Icon/Icon";
import { StoryContext } from "@kachurun/storybook-solid-vite";

const sidebarNavProps: SidebarNavProps = {
  clanDetail: {
    label: "Brian's Clan",
    machines: [
      {
        label: "Backup & Home",
        path: "/machines/backup",
        serviceCount: 3,
        status: "Online",
      },
      {
        label: "Raspberry Pi",
        path: "/machines/pi",
        serviceCount: 1,
        status: "Offline",
      },
      {
        label: "Mom's Laptop",
        path: "/machines/moms-laptop",
        serviceCount: 2,
        status: "Installed",
      },
      {
        label: "Dad's Laptop",
        path: "/machines/dads-laptop",
        serviceCount: 4,
        status: "Not Installed",
      },
    ],
  },
  extraSections: [
    {
      label: "Tools",
      links: [
        { label: "Borgbackup", path: "/tools/borgbackup" },
        { label: "Syncthing", path: "/tools/synthing" },
        { label: "Mumble", path: "/tools/mumble" },
        { label: "Minecraft", path: "/tools/minecraft" },
      ]
    },
    {
      label: "Links",
      links: [
        { label: "GitHub", path: "https://github.com/brian-the-dev" },
        { label: "Twitter", path: "https://twitter.com/brian_the_dev" },
        { label: "LinkedIn", path: "https://www.linkedin.com/in/brian-the-dev/" },
        { label: "Instagram", path: "https://www.instagram.com/brian_the_dev/" },
      ]
    }
  ]
}


const meta: Meta<RouteSectionProps> = {
  title: "Components/Sidebar/Nav",
  component: SidebarNav,
  render: (_: never, context: StoryContext<SidebarNavProps>) => {
    const history = createMemoryHistory();
    history.set({ value: "/machines/backup" });

    return (
      <div style="height: 670px;">
        <MemoryRouter
          history={history}
          root={(props) => <Suspense>{props.children}</Suspense>}

        >
          <Route
            path="/machines/backup"
            component={(props) => (
              <SidebarNav {...sidebarNavProps} />
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
