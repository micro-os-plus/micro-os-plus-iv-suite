# config

This folder holds the configuration files for the tools used to maintain the
repository, mainly formatters:

- `.clang-format` - C/C++ formatting, used by the VS Code C/C++ extension
- `.cmake-format.py` - CMake formatting
- `.prettierrc.json` and `.prettierignore` - Prettier formatting, used by VS
  Code and by the `format-md*` npm scripts

The files are referred explicitly from `.vscode/settings.json` and
`package.json`, so they are kept here instead of the top folder.

They apply only to the files in this repository; each submodule has its own
configuration.
