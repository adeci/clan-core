import { createSignal, For, Setter, Show } from "solid-js";
import { callApi, SuccessQuery } from "../api";
import { Menu } from "./Menu";
import { activeURI } from "../App";
import toast from "solid-toast";
import { A, useNavigate } from "@solidjs/router";
import { RndThumbnail } from "./noiseThumbnail";
import Icon from "./icon";
import { Filter } from "../routes/machines";
import { Typography } from "./Typography";
import { Button } from "./button";

type MachineDetails = SuccessQuery<"list_inventory_machines">["data"][string];

interface MachineListItemProps {
  name: string;
  info?: MachineDetails;
  nixOnly?: boolean;
  setFilter: Setter<Filter>;
}

export const MachineListItem = (props: MachineListItemProps) => {
  const { name, info, nixOnly } = props;

  // Bootstrapping
  const [installing, setInstalling] = createSignal<boolean>(false);

  // Later only updates
  const [updating, setUpdating] = createSignal<boolean>(false);

  const navigate = useNavigate();

  const handleInstall = async () => {
    if (!info?.deploy?.targetHost || installing()) {
      return;
    }

    const active_clan = activeURI();
    if (!active_clan) {
      toast.error("No active clan selected");
      return;
    }
    if (!info?.deploy?.targetHost) {
      toast.error(
        "Machine does not have a target host. Specify where the machine should be deployed.",
      );
      return;
    }
    setInstalling(true);
    await toast.promise(
      callApi("install_machine", {
        opts: {
          machine: {
            name: name,
            flake: {
              identifier: active_clan,
            },
          },
          no_reboot: true,
          target_host: info?.deploy.targetHost,
          debug: true,
          nix_options: [],
          password: null,
        },
      }),
      {
        loading: "Installing...",
        success: "Installed",
        error: "Failed to install",
      },
    );
    setInstalling(false);
  };

  const handleUpdate = async () => {
    if (!info?.deploy?.targetHost || installing()) {
      return;
    }

    const active_clan = activeURI();
    if (!active_clan) {
      toast.error("No active clan selected");
      return;
    }
    if (!info?.deploy.targetHost) {
      toast.error(
        "Machine does not have a target host. Specify where the machine should be deployed.",
      );
      return;
    }
    setUpdating(true);
    await toast.promise(
      callApi("update_machines", {
        base_path: active_clan,
        machines: [
          {
            name: name,
            deploy: {
              targetHost: info?.deploy.targetHost,
            },
          },
        ],
      }),
      {
        loading: "Updating...",
        success: "Updated",
        error: "Failed to update",
      },
    );
    setUpdating(false);
  };
  return (
    <div class="m-2 w-64 rounded-lg border p-3 border-def-2">
      <figure class="h-fit rounded-xl border bg-def-2 border-def-5">
        <RndThumbnail name={name} width={220} height={120} />
      </figure>
      <div class="flex-row justify-between gap-4 px-2 pt-2">
        <div class="flex flex-col">
          <A href={`/machines/${name}`}>
            <Typography hierarchy="title" size="m" weight="bold">
              {name}
            </Typography>
          </A>
          <div class="flex justify-between text-slate-600">
            <div class="flex flex-nowrap">
              <span class="h-4">
                <Icon icon="Flash" class="h-4" font-size="inherit" />
              </span>
              <Typography hierarchy="body" size="s" weight="medium">
                <Show when={info}>
                  {(d) => d()?.description || "no description"}
                </Show>
              </Typography>
            </div>

            <div class="self-end">
              <Menu
                popoverid={`menu-${props.name}`}
                label={<Icon icon={"More"} />}
              >
                <ul class="z-[1] w-64 bg-white p-2 shadow ">
                  <li>
                    <Button
                      variant="ghost"
                      class="w-full"
                      onClick={() => {
                        navigate("/machines/" + name);
                      }}
                    >
                      Details
                    </Button>
                  </li>
                  <li
                    classList={{
                      disabled: !info?.deploy?.targetHost || installing(),
                    }}
                  >
                    <Button
                      variant="ghost"
                      class="w-full"
                      onClick={handleInstall}
                    >
                      Install
                    </Button>
                  </li>
                  <li
                    classList={{
                      disabled: !info?.deploy?.targetHost || updating(),
                    }}
                  >
                    <Button
                      variant="ghost"
                      class="w-full"
                      onClick={handleUpdate}
                    >
                      Update
                    </Button>
                  </li>
                </ul>
              </Menu>
            </div>
          </div>
          {/* <div class="text-slate-600">
            <Show when={info}>
              {(d) => (
                <>
                  <Show when={d().tags}>
                    {(tags) => (
                      <span class="flex gap-1">
                        <For each={tags()}>
                          {(tag) => (
                            <button
                              type="button"
                              onClick={() =>
                                props.setFilter((prev) => {
                                  if (prev.tags.includes(tag)) {
                                    return prev;
                                  }
                                  return {
                                    ...prev,
                                    tags: [...prev.tags, tag],
                                  };
                                })
                              }
                            >
                              <span class="rounded-full px-3 py-1 bg-inv-4 fg-inv-1">
                                {tag}
                              </span>
                            </button>
                          )}
                        </For>
                      </span>
                    )}
                  </Show>
                  {d()?.deploy?.targetHost}
                </>
              )}
            </Show>
          </div> */}
        </div>
      </div>
    </div>
  );
};
