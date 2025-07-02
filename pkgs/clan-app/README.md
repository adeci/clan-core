# Clan App

A powerful application that allows users to create and manage their own Clans.

## Getting Started

Enter the `pkgs/clan-app` directory and allow [direnv] to load the `clan-app` devshell with `direnv allow`:

```console
❯ direnv allow
direnv: loading ~/Development/lol/clan/git/clan/clan-core/pkgs/ui/.envrc
direnv: loading ~/Development/lol/clan/git/clan/clan-core/.envrc
direnv: using flake
direnv: nix-direnv: Renewed cache
switch to another dev-shell using: select-shell
direnv: using flake .#ui --builders
path '/home/brian/Development/lol/clan/git/clan/clan-core/pkgs/ui' does not contain a 'flake.nix', searching up
direnv: ([/nix/store/rjnigckx9rmga58562hxw9kr5hynavcd-direnv-2.36.0/bin/direnv export zsh]) is taking a while to execute. Use CTRL-C to give up.
path '/home/brian/Development/lol/clan/git/clan/clan-core/pkgs/ui' does not contain a 'flake.nix', searching up
direnv: nix-direnv: Renewed cache
switch to another dev-shell using: select-shell
/home/brian/.config/direnv/lib/hm-nix-direnv.sh:3858: /home/brian/Development/lol/clan/git/clan/clan-core/pkgs/ui/clan-app/.local.env: No such file or directory
direnv: export +AR +AS +CC +CLAN_CORE_PATH +CONFIG_SHELL +CXX +DETERMINISTIC_BUILD +GETTEXTDATADIRS +GETTEXTDATADIRS_FOR_BUILD +GETTEXTDATADIRS_FOR_TARGET +GIT_ROOT +GSETTINGS_SCHEMAS_PATH +HOST_PATH +IN_NIX_SHELL +LD +NIX_BINTOOLS +NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_BUILD_CORES +NIX_CC +NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_CFLAGS_COMPILE +NIX_ENFORCE_NO_NATIVE +NIX_HARDENING_ENABLE +NIX_LDFLAGS +NIX_STORE +NM +NODE_PATH +OBJCOPY +OBJDUMP +PC_CONFIG_FILES +PKG_ROOT_CLAN_APP +PKG_ROOT_UI +PKG_ROOT_WEBVIEW_UI +PRJ_ROOT +PYTHONHASHSEED +PYTHONNOUSERSITE +PYTHONPATH +RANLIB +READELF +SIZE +SOURCE_DATE_EPOCH +STRINGS +STRIP +WEBVIEW_LIB_DIR +_PYTHON_HOST_PLATFORM +_PYTHON_SYSCONFIGDATA_NAME +__structuredAttrs +buildInputs +buildPhase +builder +cmakeFlags +configureFlags +depsBuildBuild +depsBuildBuildPropagated +depsBuildTarget +depsBuildTargetPropagated +depsHostHost +depsHostHostPropagated +depsTargetTarget +depsTargetTargetPropagated +doCheck +doInstallCheck +dontAddDisableDepTrack +mesonFlags +name +nativeBuildInputs +out +outputs +patches +phases +preferLocalBuild +propagatedBuildInputs +propagatedNativeBuildInputs +shell +shellHook +stdenv +strictDeps +system ~GDK_PIXBUF_MODULE_FILE ~GI_TYPELIB_PATH ~PATH ~XDG_DATA_DIRS
```

Once that has loaded, you can run the local dev environment by running:

```
$ process-compose --use-uds --keep-project -n app
```

This will start a [process-compose] instance containing two processes:

* `clan-app-ui` which is a background process running a [vite] server for `./ui` in a hot-reload fashion
* `clan-app` which is a [foreground process](https://f1bonacc1.github.io/process-compose/launcher/?h=foreground#foreground-processes),
that is started on demand and provides the [webview] wrapper for the UI.

Wait for the `clan-app-ui` process to enter the `Running` state, then navigate to the `clan-app` process and press `F7`.
This will start the [webview] window and bring `clan-app`'s terminal into the foreground, allowing for interaction with
the debugger if required.

If you need to restart, simply enter `ctrl+c` and you will be dropped back into the `process-compose` terminal.
From there you can start `clan-app` again with `F7`.

> **Note**
> If you are interacting with a breakpoint, do not continue/exit with `ctrl+c` as this will introduce a quirk
> the next time you start `clan-app` where you will be unable to see the input you are typing in a debugging session.
>
> Instead, exit the debugger with `q+Enter`.

Follow the instructions below to set up your development environment and start the application:

## Storybook

We use [Storybook] to develop UI components.
It can be started by running the following:

```console
$ process-compose --use-uds --keep-project -n storybook
```

This will start a [process-compose] instance containing two processes:

* `storybook` which is the main [storybook] process.
* `luakit` which is a [webkit]-based browser for viewing the stories with. This is the same underlying engine used when
rendering the app.

You can run storybook tests with `npm run test-storybook`.
If you change how a component(s) renders,
you will need to update the snapshots with `npm run test-storybook-update-snapshots`.

## Start clan-app without process-compose


1. **Navigate to the Webview UI Directory**

   Go to the `clan-core/pkgs/clan-app/ui` directory and start the web server by executing:

   ```bash
   npm install
   vite
   ```

2. **Start the Clan App**

   In the `clan-core/pkgs/clan-app` directory, execute the following command:

   ```bash
   ./bin/clan-app --debug --content-uri http://localhost:3000
   ```

This will start the application in debug mode and link it to the web server running at `http://localhost:3000`.

### Debugging Style and Layout

```bash
# Enable the GTK debugger
gsettings set org.gtk.Settings.Debug enable-inspector-keybinding true

# Start the application with the debugger attached
GTK_DEBUG=interactive ./bin/clan-app --debug
```

Appending `--debug` flag enables debug logging printed into the console.

Debugging crashes in the `webview` library can be done by executing:

```bash
$ ./pygdb.sh ./bin/clan-app  --content-uri http://localhost:3000/ --debug 
```

I recommend creating the file `.local.env` with the content:
```bash
export WEBVIEW_LIB_DIR=$HOME/Projects/webview/build/core
```
where `WEBVIEW_LIB_DIR` points to a local checkout of the webview lib source, that has been build by hand. The `.local.env` file will be automatically sourced if it exists and will be ignored by git.

### Profiling

To activate profiling you can run

```bash
CLAN_CLI_PERF=1 ./bin/clan-app
```

