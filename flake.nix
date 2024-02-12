{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    nixpkgsUnstable.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flakeUtils.url = "github:numtide/flake-utils";
  };
  outputs =
    { self
    , nixpkgs
    , nixpkgsUnstable
    , flakeUtils
    ,
    }:
    flakeUtils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        pkgsUnstable = nixpkgsUnstable.legacyPackages.${system};
        pkgsFor = nixpkgs.legacyPackages;
      in
      {
        packages = flakeUtils.lib.flattenTree {
          node = pkgs.nodejs_20;
          live-server = pkgs.nodePackages.live-server;
        };
        devShell = pkgs.mkShell {
          buildInputs = with self.packages.${system}; [
            node
            live-server
          ];
        };
      }
    );
}
