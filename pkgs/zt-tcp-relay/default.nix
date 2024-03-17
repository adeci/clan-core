{
  lib,
  rustPlatform,
  fetchFromGitHub,
}:

rustPlatform.buildRustPackage {
  pname = "zt-tcp-relay";
  version = "unstable-2023-07-11";

  src = fetchFromGitHub {
    owner = "alexander-akhmetov";
    repo = "zt-tcp-relay";
    rev = "b8d3a892c60581e938724a1d5dfb0e1884a9fa6f";
    hash = "sha256-7ZNWyPf/b4dJqyPQFTBrv2RvY9dDz990CvwcHpaCKSA=";
  };

  cargoHash = "sha256-IOxWLvA6jqSYqfDZJn9Set/KKFhf03NsNm7Y67paxCQ=";

  meta = with lib; {
    description = "ZeroTier One TCP relay";
    homepage = "https://github.com/alexander-akhmetov/zt-tcp-relay";
    license = licenses.mit;
    maintainers = with maintainers; [ mic92 ];
    mainProgram = "zt-tcp-relay";
  };
}
