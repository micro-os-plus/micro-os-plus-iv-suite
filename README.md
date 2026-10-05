# micro-os-plus-iv-suite

This repository provides the **µOS++ IV Suite**, a set of projects that together
form the **fourth edition** of µOS++.

Each project within the suite is maintained in its own Git repository and is
included here as a submodule for unified access.

Compared to a monorepo, this approach enables more effective testing and
supports the development of distinct web sub-sites, each with its own URL.

## Getting the Sources

The project is open source and is available on GitHub at
[micro-os-plus/micro-os-plus-iv-suite](https://github.com/micro-os-plus/micro-os-plus-iv-suite.git).

To obtain a local copy, execute:

```sh
rm -rf ~/Work/micro-os-plus/micro-os-plus-iv-suite.git && \
mkdir -p ~/Work/micro-os-plus && \
git clone --recurse-submodules \
  https://github.com/micro-os-plus/micro-os-plus-iv-suite.git \
  ~/Work/micro-os-plus/micro-os-plus-iv-suite.git
```

(to be continued)
