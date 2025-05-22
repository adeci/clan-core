import { Navigate, RouteDefinition } from "@solidjs/router";
import { IconVariant } from "@/src/components/icon";
import { lazy } from "solid-js";

export type AppRoute = Omit<RouteDefinition, "children"> & {
  label: string;
  icon?: IconVariant;
  children?: AppRoute[];
  hidden?: boolean;
};

const lazyLoad = (path: string) => lazy(() => import(path));

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
        component: lazyLoad("./machines/list"),
      },
      {
        path: "/create",
        label: "Create",
        component: lazyLoad("./machines/create"),
      },
      {
        path: "/:id",
        label: "Details",
        hidden: true,
        component: lazyLoad("./machines/details"),
      },
      {
        path: "/:id/vars",
        label: "Vars",
        hidden: true,
        component: lazyLoad("./machines/install/vars-step"),
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
        component: lazyLoad("./clans/list"),
      },
      {
        path: "/create",
        label: "Create",
        component: lazyLoad("./clans/create"),
      },
      {
        path: "/:id",
        label: "Details",
        hidden: true,
        component: lazyLoad("./clans/details"),
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
        component: lazyLoad("./modules/list"),
      },
      {
        path: "details/:id",
        label: "Details",
        hidden: true,
        component: lazyLoad("./modules/details"),
      },
      {
        path: "/add/:id",
        label: "Details",
        hidden: true,
        component: lazyLoad("./modules/add"),
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
        component: lazyLoad("./flash/view"),
      },
    ],
  },
  {
    path: "/welcome",
    label: "",
    hidden: true,
    component: lazyLoad("./welcome"),
  },
  {
    path: "/internal-dev",
    label: "Internal (Only visible in dev mode)",
    children: [
      {
        path: "/hosts",
        label: "Local Hosts",
        component: lazyLoad("./hosts/list"),
      },
      {
        path: "/3d",
        label: "3D-Playground",
        component: lazyLoad("../three"),
      },
      {
        path: "/api_testing",
        label: "api_testing",
        hidden: false,
        component: lazyLoad("../api_test"),
      },
      {
        path: "/components",
        label: "Components",
        hidden: false,
        component: lazyLoad("./components"),
      },
    ],
  },
];

export default routes;
