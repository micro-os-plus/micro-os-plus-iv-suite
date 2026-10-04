# README-MAINTAINER

## Submodules

The submodules were added with the following commands:

```sh
mkdir -p 3rd-party/arm
git submodule add https://github.com/xpack-3rd-party/arm-cmsis-core-xpack.git 3rd-party/arm/arm-cmsis-core
git submodule add --name 3rd-party/arm/arm-cmsis-rtos-validator https://github.com/xpacks/arm-cmsis-rtos-validator.git 3rd-party/arm/arm-cmsis-rtos-validator

mkdir -p 3rd-party/boost
git submodule add --name 3rd-party/boost/boost-ut-xpack https://github.com/xpack-3rd-party/boost-ut-xpack.git 3rd-party/boost/boost-ut

mkdir -p 3rd-party/catch2
git submodule add --name 3rd-party/catch2/catch2-xpack https://github.com/xpack-3rd-party/catch2-xpack.git 3rd-party/catch2/catch2

mkdir -p 3rd-party/chan
git submodule add --name 3rd-party/chan/chan-fatfs https://github.com/xpacks/chan-fatfs.git 3rd-party/chan/chan-fatfs

mkdir -p 3rd-party/google
git submodule add --name 3rd-party/google/googletest-xpack https://github.com/xpack-3rd-party/googletest-xpack.git 3rd-party/google/googletest

mkdir -p 3rd-party/libucontext
git submodule add --name 3rd-party/libucontext/libucontext-xpack https://github.com/xpack-3rd-party/libucontext-xpack.git 3rd-party/libucontext/libucontext

mkdir -p 3rd-party/lixpaulian
git submodule add --name 3rd-party/lixpaulian/micro-http-client https://github.com/lixpaulian/micro-http-client.git 3rd-party/lixpaulian/micro-http-client
git config -f .gitmodules submodule.3rd-party/lixpaulian/micro-http-client.branch main

mkdir -p 3rd-party/raspberrypi
git submodule add --name 3rd-party/raspberrypi/raspberrypi-pico-sdk-xpack https://github.com/xpack-3rd-party/raspberrypi-pico-sdk-xpack.git 3rd-party/raspberrypi/pico-sdk

mkdir -p 3rd-party/segger
git submodule add https://github.com/xpack-3rd-party/segger-rtt-xpack.git 3rd-party/segger/segger-rtt
git submodule add https://github.com/xpack-3rd-party/segger-system-view-xpack.git 3rd-party/segger/segger-system-view

mkdir -p core
git submodule add --name core/memory-allocators-xpack https://github.com/micro-os-plus/memory-allocators-xpack.git core/memory-allocators
git submodule add https://github.com/micro-os-plus/semihosting-xpack.git core/semihosting
git submodule add https://github.com/micro-os-plus/startup-xpack.git core/startup
git submodule add https://github.com/micro-os-plus/utils-lists-xpack.git core/utils-lists

mkdir -p debug
git submodule add https://github.com/micro-os-plus/diag-trace-xpack.git debug/diag-trace

mkdir -p maintenance
git submodule add --name helpers/build-helper-xpack https://github.com/micro-os-plus/build-helper-xpack.git maintenance/build-helper

mkdir -p io
git submodule add --name io/posix-io-xpack https://github.com/micro-os-plus/posix-io-xpack.git io/posix-io

mkdir -p rtos
git submodule add --name rtos/cmsis-os-xpack https://github.com/micro-os-plus/cmsis-os-xpack.git rtos/cmsis-os
git submodule add --name rtos/rtos-xpack https://github.com/micro-os-plus/rtos-xpack.git rtos/rtos

mkdir -p rtos/ports
git submodule add --name rtos/ports/rtos-cortexm-xpack https://github.com/micro-os-plus/rtos-cortexm-xpack.git rtos/ports/rtos-port-cortexm
git submodule add --name rtos/ports/rtos-synthetic-posix-xpack https://github.com/micro-os-plus/rtos-synthetic-posix-xpack.git rtos/ports/rtos-port-synthetic-posix

mkdir -p targets/architectures
git submodule add --name targets/architecture-aarch32-xpack https://github.com/micro-os-plus/architecture-aarch32-xpack.git targets/architectures/architecture-aarch32
git submodule add --name targets/architecture-aarch64-xpack https://github.com/micro-os-plus/architecture-aarch64-xpack.git targets/architectures/architecture-aarch64
git submodule add --name targets/architecture-cortexm-xpack https://github.com/micro-os-plus/architecture-cortexm-xpack.git targets/architectures/architecture-cortexm
git submodule add --name targets/architecture-riscv-xpack https://github.com/micro-os-plus/architecture-riscv-xpack.git targets/architectures/architecture-riscv
git submodule add --name targets/architecture-synthetic-posix-xpack https://github.com/micro-os-plus/architecture-synthetic-posix-xpack.git targets/architectures/architecture-synthetic-posix

mkdir -p targets/devices
git submodule add --name targets/devices-qemu-aarch32-xpack https://github.com/micro-os-plus/devices-qemu-aarch32-xpack.git targets/devices/devices-qemu-aarch32
git submodule add --name targets/devices-qemu-aarch64-xpack https://github.com/micro-os-plus/devices-qemu-aarch64-xpack.git targets/devices/devices-qemu-aarch64
git submodule add --name targets/devices-qemu-cortexm-xpack https://github.com/micro-os-plus/devices-qemu-cortexm-xpack.git targets/devices/devices-qemu-cortexm
git submodule add --name targets/devices-qemu-riscv-xpack https://github.com/micro-os-plus/devices-qemu-riscv-xpack.git targets/devices/devices-qemu-riscv

mkdir -p testing
git submodule add https://github.com/micro-os-plus/micro-test-plus-xpack.git testing/micro-test-plus

```

## Update submodules

To bring all submodules to the latest commit of their `xpack` branch:

```sh
node maintenance/scripts/update-submodules.mjs --dry-run   # report only
node maintenance/scripts/update-submodules.mjs             # update
```

The script reads `.gitmodules`, so new submodules are picked up automatically. A
submodule that must follow a different branch can set it with
`git config -f .gitmodules submodule.<name>.branch <branch>`. Submodules with
uncommitted changes or unpushed commits are skipped.

The new submodule pointers are not committed; review and commit them manually.
