import { SuccessData } from "@/src/api";
import { Button } from "@/src/components/button";
import { Header } from "@/src/layout/header";
import { createModulesQuery } from "@/src/queries";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, For, Match, Switch } from "solid-js";
import { Typography } from "@/src/components/Typography";
import { Menu } from "@/src/components/Menu";
import { makePersisted } from "@solid-primitives/storage";
import { useQueryClient } from "@tanstack/solid-query";
import cx from "classnames";
import Icon from "@/src/components/icon";
import { useClanContext } from "@/src/contexts/clan";

export type ModuleInfo = SuccessData<"list_modules">["localModules"][string];

interface CategoryProps {
  categories: string[];
}
const Categories = (props: CategoryProps) => {
  return (
    <span class="inline-flex h-full align-middle">
      <Typography hierarchy="label" size="default" class="w-16" tag="div">
        Categories:
      </Typography>
      {props.categories.map((category) => (
        <Typography hierarchy="label" size="default">
          {category}
        </Typography>
      ))}
    </span>
  );
};

interface RolesProps {
  roles: Record<string, null>;
}
const Roles = (props: RolesProps) => {
  return (
    <div class="inline-flex h-full align-middle">
      <Typography hierarchy="label" size="default" class="w-16" tag="div">
        Type:
      </Typography>

      {Object.keys(props.roles).map((role) => (
        <Typography hierarchy="label" size="default">
          {role}
        </Typography>
      ))}
    </div>
  );
};

const ModuleItem = (props: {
  name: string;
  info: ModuleInfo;
  source: string;
  class?: string;
}) => {
  const { name, info } = props;
  const navigate = useNavigate();

  return (
    <div
      class={cx(
        "col-span-1 flex flex-col border-b border-secondary-200 pb-4 gap-2",
        props.class,
      )}
    >
      <header class="flex flex-row items-center justify-between">
        <div class="flex flex-col gap-0">
          <A href={`/modules/details/${props.source}/${info.manifest.name}`}>
            <div class="">
              <div class="flex flex-col">
                {/* <Categories categories={info.categories} /> */}
                <Typography hierarchy="title" size="m" weight="medium">
                  {info.manifest.name}
                </Typography>
              </div>
            </div>
          </A>

          <div class="w-full">
            <Typography hierarchy="body" size="xs">
              {info.manifest.description}
            </Typography>
          </div>
        </div>
        <Menu popoverid={`menu-${props.name}`} label={<Icon icon={"More"} />}>
          <ul class="z-[1] w-52 bg-slate-100 p-2 shadow">
            <li>
              <a
                onClick={() => {
                  navigate(`/modules/details/${name}`);
                }}
              >
                Configure
              </a>
            </li>
          </ul>
        </Menu>
      </header>
      <Roles roles={info.roles || {}} />
      <div class="w-full">
        <Categories categories={info.manifest.categories} />
      </div>
    </div>
  );
};

const ModuleList = () => {
  const queryClient = useQueryClient();
  const { activeClanURI } = useClanContext();
  const modulesQuery = createModulesQuery(activeClanURI(), {
    features: ["inventory"],
  });

  const [view, setView] = makePersisted(createSignal<"list" | "grid">("list"), {
    name: "modules_view",
    storage: localStorage,
  });

  const refresh = async () => {
    const clanURI = activeClanURI();

    // do nothing if there is no active URI
    if (!clanURI) {
      return;
    }

    await queryClient.invalidateQueries({
      // Invalidates the cache for of all types of machine list at once
      queryKey: [clanURI, "list_modules"],
    });
  };
  return (
    <>
      <Header
        title="App Store"
        toolbar={
          <>
            <Button
              variant="light"
              size="s"
              onClick={() => refresh()}
              startIcon={<Icon icon="Update" />}
            />

            <div class="button-group">
              <Button
                onclick={() => setView("list")}
                variant={view() == "list" ? "dark" : "light"}
                size="s"
                startIcon={<Icon icon="List" />}
              />

              <Button
                onclick={() => setView("grid")}
                variant={view() == "grid" ? "dark" : "light"}
                size="s"
                startIcon={<Icon icon="Grid" />}
              />
            </div>
          </>
        }
      />
      <Switch fallback="Error">
        <Match when={modulesQuery.isFetching}>Loading....</Match>
        <Match when={modulesQuery.data}>
          {(modules) => (
            <div
              class="grid gap-6 p-6"
              classList={{
                "grid-cols-1": view() === "list",
                "grid-cols-2": view() === "grid",
              }}
            >
              <For each={Object.entries(modules().modulesPerSource)}>
                {([sourceName, v]) => (
                  <>
                    <div>
                      <Typography size="default" hierarchy="label">
                        {sourceName}
                      </Typography>
                    </div>
                    <For each={Object.entries(v)}>
                      {([moduleName, moduleInfo]) => (
                        <ModuleItem
                          source={sourceName}
                          info={moduleInfo}
                          name={moduleName}
                          class={view() == "grid" ? cx("max-w-md") : ""}
                        />
                      )}
                    </For>
                  </>
                )}
              </For>
              <div>{"localModules"}</div>
              <For each={Object.entries(modules().localModules)}>
                {([moduleName, moduleInfo]) => (
                  <ModuleItem
                    source={"localModules"}
                    info={moduleInfo}
                    name={moduleName}
                    class={view() == "grid" ? cx("max-w-md") : ""}
                  />
                )}
              </For>
            </div>
          )}
        </Match>
      </Switch>
    </>
  );
};

export default ModuleList;
