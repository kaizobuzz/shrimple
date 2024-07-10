let
  unstable = import (fetchTarball "https://nixos.org/channels/nixos-unstable/nixexprs.tar.xz") { };
in
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell
{
    nativeBuildInputs = with pkgs;[
        go
        gopls
        unstable.templ
    ];
}
