# 3rd-party

This folder holds third-party source code libraries used by µOS++, packaged as
xPacks and included as Git submodules.

The submodules are grouped by vendor, or by project when there is no distinct
vendor, one sub-folder each:

- `arm/arm-cmsis-core` - Arm CMSIS Core
- `arm/arm-cmsis-rtos-validator` - the Arm CMSIS RTOS validator
- `boost/boost-ut` - Boost UT, the C++20 μ(micro)/unit testing framework
- `catch2/catch2` - Catch2, a C++-native unit testing framework
- `chan/chan-fatfs` - the Chan FAT file system
- `google/googletest` - Google Test
- `libucontext/libucontext` - the `ucontext.h` C API
- `lixpaulian/micro-http-client` - a compact HTTP(S) client for embedded systems
- `lwip/lwip` - the lwIP TCP/IP stack (future)
- `raspberrypi/pico-sdk` - the Raspberry Pi Pico SDK
- `segger/segger-rtt` - SEGGER RTT support
- `segger/segger-system-view` - SEGGER SystemView support

The future libraries are empty folders, kept with a `.gitkeep` file, until their
repositories are available.

The upstream code is not modified here; any change must be made in the
corresponding `xpack-3rd-party` repository.

TODO: `arm/arm-cmsis-rtos-validator` and `chan/chan-fatfs` are still in the old
`xpacks` GitHub organisation, and use the `@xpacks` npm scope; migrate them to
`xpack-3rd-party`, rename them with the `-xpack` suffix, and update the
submodule names and URLs in `.gitmodules`.

TODO: `lixpaulian/micro-http-client` is not packaged as an xPack and has no
`xpack` branch; it follows `main`, via a `branch` entry in `.gitmodules`.

New third-party libraries should be added in the folder of their vendor (create
it if needed), as described in
[README-MAINTAINER](../maintenance/README-MAINTAINER.md).
