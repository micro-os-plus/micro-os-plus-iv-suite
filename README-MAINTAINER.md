# README-MAINTAINER

## Submodules

The submodules were added with the following commands:

```sh
mkdir -p 3rd-party/segger
git submodule add https://github.com/xpack-3rd-party/segger-rtt-xpack.git 3rd-party/segger/segger-rtt
git submodule add https://github.com/xpack-3rd-party/segger-system-view-xpack.git 3rd-party/segger/segger-system-view

mkdir -p 3rd-party/arm
git submodule add https://github.com/xpack-3rd-party/arm-cmsis-core-xpack.git 3rd-party/arm/arm-cmsis-core

mkdir -p core
git submodule add https://github.com/micro-os-plus/startup-xpack.git core/startup
git submodule add https://github.com/micro-os-plus/semihosting-xpack.git core/semihosting
git submodule add https://github.com/micro-os-plus/utils-lists-xpack.git core/utils-lists

mkdir -p diag
git submodule add https://github.com/micro-os-plus/diag-trace-xpack.git diag/diag-trace

mkdir -p testing
git submodule add https://github.com/micro-os-plus/micro-test-plus-xpack.git testing/micro-test-plus

mkdir -p helpers
git submodule add https://github.com/micro-os-plus/build-helper-xpack.git helpers/build-helper

mkdir -p targets
git submodule add https://github.com/micro-os-plus/architecture-synthetic-posix-xpack.git targets/architecture-synthetic-posix
git submodule add https://github.com/micro-os-plus/architecture-cortexm-xpack.git targets/architecture-cortexm
git submodule add https://github.com/micro-os-plus/devices-qemu-cortexm-xpack.git targets/devices-qemu-cortexm
git submodule add https://github.com/micro-os-plus/architecture-riscv-xpack.git targets/architecture-riscv
git submodule add https://github.com/micro-os-plus/devices-qemu-riscv-xpack.git targets/devices-qemu-riscv
git submodule add https://github.com/micro-os-plus/architecture-aarch32-xpack.git targets/architecture-aarch32
git submodule add https://github.com/micro-os-plus/devices-qemu-aarch32-xpack.git targets/devices-qemu-aarch32
git submodule add https://github.com/micro-os-plus/architecture-aarch64-xpack.git targets/architecture-aarch64
git submodule add https://github.com/micro-os-plus/devices-qemu-aarch64-xpack.git targets/devices-qemu-aarch64

```

## Update submodules

To bring all submodules to the latest commit of their `xpack` branch:

```sh
node scripts/update-submodules.mjs --dry-run   # report only
node scripts/update-submodules.mjs             # update
```

The script reads `.gitmodules`, so new submodules are picked up automatically.
A submodule that must follow a different branch can set it with
`git config -f .gitmodules submodule.<name>.branch <branch>`.
Submodules with uncommitted changes or unpushed commits are skipped.

The new submodule pointers are not committed; review and commit them manually.
