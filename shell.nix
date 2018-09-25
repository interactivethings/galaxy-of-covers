let
  unpinned = import <nixpkgs> {};
  pkgs = import (unpinned.fetchFromGitHub
    { owner = "NixOS";
      repo = "nixpkgs";
      rev = "0463c2020e065368fafcca95954ae32bbbdec2e0";
      sha256 = "0wqvn548x9g8zq1pnzwiy6sp6dndkdsk738qwir29xg1zar488d2";
    }) {};

  nodejs = pkgs.nodejs-10_x;

in pkgs.mkShell {
  buildInputs = [
    nodejs
    pkgs.python3
    pkgs.python3Packages.pip
    pkgs.python3Packages.requests
    pkgs.python3Packages.beautifulsoup4
  ] ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.darwin.apple_sdk.frameworks.CoreServices ];
}

