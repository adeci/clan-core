import { Navigate, RouteDefinition } from "@solidjs/router";
import {
  CreateMachine,
  MachineDetails,
  MachineListView,
} from "@/src/routes/machines";
import { VarsPage } from "@/src/routes/machines/install/vars-step";
import { ClanDetails, ClanList, CreateClan } from "@/src/routes/clans";
import { ModuleList } from "@/src/routes/modules/list";
import { ModuleDetails } from "@/src/routes/modules/details";
import { ModuleDetails as AddModule } from "@/src/routes/modules/add";
import { Flash } from "@/src/routes/flash/view";
import { Welcome } from "@/src/routes/welcome";
import { HostList } from "@/src/routes/hosts/view";
import { ThreePlayground } from "@/src/three";
import { ApiTester } from "@/src/api_test";
import { Components } from "@/src/routes/components";
import { IconVariant } from "@/src/components/icon";

export type AppRoute = Omit<RouteDefinition, "children"> & {
  label: string;
  icon?: IconVariant;
  children?: AppRoute[];
  hidden?: boolean;
};

const routes: AppRoute[] = [
  {
    path: "/",
    label: "",
    hidden: true,
    component: () => <Navigate href="/machines" />,
  },
  {
    path: "/machines",
    label: "Machines",
    icon: "Grid",
    children: [
      {
        path: "/",
        label: "Overview",
        component: () => <MachineListView />,
      },
      {
        path: "/create",
        label: "Create",
        component: () => <CreateMachine />,
      },
      {
        path: "/:id",
        label: "Details",
        hidden: true,
        component: () => <MachineDetails />,
      },
      {
        path: "/:id/vars",
        label: "Vars",
        hidden: true,
        component: () => <VarsPage />,
      },
    ],
  },
  {
    path: "/clans",
    label: "Clans",
    hidden: true,
    icon: "List",
    children: [
      {
        path: "/",
        label: "Overview",
        component: () => <ClanList />,
      },
      {
        path: "/create",
        label: "Create",
        component: () => <CreateClan />,
      },
      {
        path: "/:id",
        label: "Details",
        hidden: true,
        component: () => <ClanDetails />,
      },
    ],
  },
  {
    path: "/modules",
    label: "Modules",
    icon: "Search",
    children: [
      {
        path: "/",
        label: "App Store",
        component: () => <ModuleList />,
      },
      {
        path: "details/:id",
        label: "Details",
        hidden: true,
        component: () => <ModuleDetails />,
      },
      {
        path: "/add/:id",
        label: "Details",
        hidden: true,
        component: () => <AddModule />,
      },
    ],
  },
  {
    path: "/tools",
    label: "Tools",
    icon: "Folder",
    children: [
      {
        path: "/flash",
        label: "Flash Installer",
        component: () => <Flash />,
      },
    ],
  },
  {
    path: "/welcome",
    label: "",
    hidden: true,
    component: () => <Welcome />,
  },
  {
    path: "/internal-dev",
    label: "Internal (Only visible in dev mode)",
    children: [
      {
        path: "/hosts",
        label: "Local Hosts",
        component: () => <HostList />,
      },
      {
        path: "/3d",
        label: "3D-Playground",
        component: () => <ThreePlayground />,
      },
      {
        path: "/api_testing",
        label: "api_testing",
        hidden: false,
        component: () => <ApiTester />,
      },
      {
        path: "/components",
        label: "Components",
        hidden: false,
        component: () => <Components />,
      },
    ],
  },
];

export default routes;
