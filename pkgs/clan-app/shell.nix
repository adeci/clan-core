{
  lib,
  glib,
  gsettings-desktop-schemas,
  stdenv,
  clan-app,
  mkShell,
  ruff,
  desktop-file-utils,
  xdg-utils,
  mypy,
  python3,
  gtk4,
  libadwaita,
  self',
}:

let
  devshellTestDeps =
    clan-app.externalTestDeps
    ++ (with python3.pkgs; [
      rope
      mypy
      ipdb
      setuptools
      wheel
      pip
    ]);
in
mkShell {
  inherit (clan-app) nativeBuildInputs propagatedBuildInputs;

  inputsFrom = [ self'.devShells.default ];

  buildInputs =
    [
      glib
      ruff
      gtk4
      gtk4.dev # has the demo called 'gtk4-widget-factory'
      libadwaita.devdoc # has the demo called 'adwaita-1-demo'
    ]
    ++ devshellTestDeps

    # Dependencies for testing for linux hosts
    ++ (lib.optionals stdenv.isLinux [
      xdg-utils # install desktop files
      desktop-file-utils # verify desktop files
    ]);

  PYTHONBREAKPOINT = "ipdb.set_trace";

  shellHook = ''
    export GIT_ROOT=$(git rev-parse --show-toplevel)
    export PKG_ROOT=$GIT_ROOT/pkgs/clan-app

    # Add current package to PYTHONPATH
    export PYTHONPATH="$PKG_ROOT''${PYTHONPATH:+:$PYTHONPATH:}"

    # Add clan-app command to PATH
    export PATH="$PKG_ROOT/bin":"$PATH"

    # Add clan-cli to the python path so that we can import it without building it in nix first
    export PYTHONPATH="$GIT_ROOT/pkgs/clan-cli":"$PYTHONPATH"

    export XDG_DATA_DIRS=${gtk4}/share/gsettings-schemas/gtk4-4.14.4:$XDG_DATA_DIRS
    export XDG_DATA_DIRS=${gsettings-desktop-schemas}/share/gsettings-schemas/gsettings-desktop-schemas-46.0:$XDG_DATA_DIRS
  '';
}
