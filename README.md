# micro-os-plus-iv-suite

This repository provides the **µOS++ IV Suite**, a set of projects that together
form the **fourth edition** of µOS++.

Each project within the suite is maintained in its own Git repository and is
included here as a submodule for unified access.

Compared to a monorepo, this approach enables more effective testing and
supports the development of distinct web sub-sites, each with its own URL.

## Getting the sources

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

## Navigating the sources

The projects are grouped by role in a few top-level folders; most of the
leaf folders are Git submodules, each pointing to the repository of a separate
project.

- `core/` - the basic µOS++ libraries, used by all other projects:
  - `memory-allocators` - the µOS++ memory allocators
  - `semihosting` - the portable semihosting definitions
  - `startup` - the startup code for bare-metal platforms
  - `utils-lists` - the µOS++ intrusive lists
- `debug/` - the debugging support:
  - `diag-trace` - the `trace::printf()` tracing infrastructure
- `io/` - the input/output support:
  - `posix-io` - the POSIX I/O layer
- `rtos/` - the real-time operating system:
  - `rtos` - the µOS++ RTOS
  - `cmsis-os` - the CMSIS RTOS compatibility layer
  - `ports/` - the architecture specific scheduler ports
    (`rtos-port-cortexm` and `rtos-port-synthetic-posix`; the
    AArch32, AArch64 and RISC-V ports are placeholders, to be added later)
- `targets/` - the code specific to the hardware:
  - `architectures/` - the architecture ports (`architecture-aarch32`,
    `architecture-aarch64`, `architecture-cortexm`, `architecture-riscv`
    and `architecture-synthetic-posix`, to run on the development host)
  - `devices/` - the device support for the QEMU emulated boards
    (`devices-qemu-aarch32`, `devices-qemu-aarch64`, `devices-qemu-cortexm`
    and `devices-qemu-riscv`)
  - `platforms/` - the board support libraries (currently empty)
- `testing/` - the testing support:
  - `micro-test-plus` - µTest++, a lightweight testing framework for
    embedded platforms
- `3rd-party/` - libraries from other sources, packed as xPacks,
  grouped by vendor:
  - `arm/` - Arm CMSIS Core and the CMSIS RTOS validator
  - `boost/` - Boost μ(micro)/Unit Testing Framework
  - `catch2/` - Catch2, a C++ test framework
  - `chan/` - Chan FatFs, a FAT file system
  - `google/` - Google Test
  - `libucontext/` - an implementation of the `ucontext.h` C API
  - `lixpaulian/micro-http-client` - a compact HTTP(S) client for embedded systems
  - `lwip/` - lwIP, a TCP/IP stack (placeholder, to be added later)
  - `raspberrypi/pico-sdk` - the Raspberry Pi Pico SDK
  - `segger/` - SEGGER RTT and SEGGER SystemView
- `maintenance/` - the files used to build, format and maintain the projects,
  not part of the µOS++ runtime (see [maintenance/README.md](maintenance/README.md))
- `website/` - the future µOS++ IV project website (not yet available)

## Using in projects

This hierarchy is useful to get all projects in a single place for inspecting or for
global searches, but for actual use in projects, the websites and tests are useless
and increase the clutter.

For actual use in projects it is more efficient to install the required projects
with `xpm`, which brings in only the sources and the CMake and Meson build
configurations.

The command below is a bulk-install example to show how the packages are named;
it is not a recommended dependency list for a single project. In a real project,
install only the packages you need and select one target architecture. The
architecture packages are alternatives, not components to combine in one
project; choose the matching device package too when using a supported QEMU
target.

```bash
mkdir my-project && cd my-project
xpm init
xpm install --verbose \
  @micro-os-plus/architecture-aarch32 \
  @micro-os-plus/architecture-aarch64 \
  @micro-os-plus/architecture-cortexm \
  @micro-os-plus/architecture-riscv \
  @micro-os-plus/architecture-synthetic-posix \
  @micro-os-plus/build-helper \
  @micro-os-plus/devices-qemu-aarch32 \
  @micro-os-plus/devices-qemu-aarch64 \
  @micro-os-plus/devices-qemu-cortexm \
  @micro-os-plus/devices-qemu-riscv \
  @micro-os-plus/diag-trace \
  @micro-os-plus/micro-test-plus \
  @micro-os-plus/semihosting \
  @micro-os-plus/startup \
  @micro-os-plus/utils-lists \
  @xpack-3rd-party/arm-cmsis-core \
  @xpack-3rd-party/boost-ut \
  @xpack-3rd-party/catch2 \
  @xpack-3rd-party/googletest \
  @xpack-3rd-party/raspberrypi-pico-sdk \
  github:lixpaulian/micro-http-client 

```

This command installs all the listed packages below the `xpacks` folder.

```bash
$ tree -L 3
.
├── LICENSE
├── package.json
└── xpacks
    ├── @lix
    │   └── micro-http-client -> /home/ilg/.local/xPacks/@lix/micro-http-client/1.0.3
    ├── @micro-os-plus
    │   ├── architecture-aarch32 -> /home/ilg/.local/xPacks/@micro-os-plus/architecture-aarch32/4.2.1
    │   ├── architecture-aarch64 -> /home/ilg/.local/xPacks/@micro-os-plus/architecture-aarch64/4.1.0
    │   ├── architecture-cortexm -> /home/ilg/.local/xPacks/@micro-os-plus/architecture-cortexm/8.2.0
    │   ├── architecture-riscv -> /home/ilg/.local/xPacks/@micro-os-plus/architecture-riscv/6.0.0
    │   ├── architecture-synthetic-posix -> /home/ilg/.local/xPacks/@micro-os-plus/architecture-synthetic-posix/5.0.2
    │   ├── build-helper -> /home/ilg/.local/xPacks/@micro-os-plus/build-helper/2.17.0
    │   ├── devices-qemu-aarch32 -> /home/ilg/.local/xPacks/@micro-os-plus/devices-qemu-aarch32/5.0.1
    │   ├── devices-qemu-aarch64 -> /home/ilg/.local/xPacks/@micro-os-plus/devices-qemu-aarch64/5.0.1
    │   ├── devices-qemu-cortexm -> /home/ilg/.local/xPacks/@micro-os-plus/devices-qemu-cortexm/7.0.1
    │   ├── devices-qemu-riscv -> /home/ilg/.local/xPacks/@micro-os-plus/devices-qemu-riscv/2.1.0
    │   ├── diag-trace -> /home/ilg/.local/xPacks/@micro-os-plus/diag-trace/5.0.1
    │   ├── micro-test-plus -> /home/ilg/.local/xPacks/@micro-os-plus/micro-test-plus/5.0.1
    │   ├── semihosting -> /home/ilg/.local/xPacks/@micro-os-plus/semihosting/11.0.0
    │   ├── startup -> /home/ilg/.local/xPacks/@micro-os-plus/startup/9.1.0
    │   └── utils-lists -> /home/ilg/.local/xPacks/@micro-os-plus/utils-lists/5.0.0
    └── @xpack-3rd-party
        ├── arm-cmsis-core -> /home/ilg/.local/xPacks/@xpack-3rd-party/arm-cmsis-core/5.4.0-6
        ├── boost-ut -> /home/ilg/.local/xPacks/@xpack-3rd-party/boost-ut/1.1.8-2
        ├── catch2 -> /home/ilg/.local/xPacks/@xpack-3rd-party/catch2/2.13.8-2
        ├── googletest -> /home/ilg/.local/xPacks/@xpack-3rd-party/googletest/1.11.0-1
        └── raspberrypi-pico-sdk -> /home/ilg/.local/xPacks/@xpack-3rd-party/raspberrypi-pico-sdk/2.3.0-5

26 directories, 2 files
```

By default, `xpm` links packages from its local cache into the `xpacks` folder.
To install copies in the project instead, use the `--copy` option.

(to be continued)
