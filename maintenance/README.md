# maintenance

This folder holds the files used to build, format and maintain the projects;
none of them is part of the µOS++ runtime:

- `README-MAINTAINER.md` - the maintainer notes for this repository
- `build-helper` - CMake scripts, Doxygen and VS Code configurations, and other
  files used by the µOS++ builds, included as a Git submodule
- `config/` - the configuration files for the tools used in this repository
- `scripts/` - the scripts used to maintain this repository

The packages consume `build-helper` as a dependency, from its own repository;
the submodule is present here to allow editing it together with the rest.
