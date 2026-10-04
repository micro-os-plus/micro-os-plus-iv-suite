# targets

This folder holds the µOS++ source code libraries that port the system to
specific targets, included as Git submodules, grouped by category:

- `architectures/` - the architecture ports (the core specific code):
  - `architecture-aarch32` - Arm AArch32
  - `architecture-aarch64` - Arm AArch64
  - `architecture-cortexm` - Arm Cortex-M
  - `architecture-riscv` - RISC-V
  - `architecture-synthetic-posix` - synthetic architecture, running as a POSIX
    process on the development machine
- `devices/` - the device support (the peripherals and the memory map of a
  family of devices):
  - `devices-qemu-aarch32` - the QEMU AArch32 devices
  - `devices-qemu-aarch64` - the QEMU AArch64 devices
  - `devices-qemu-cortexm` - the QEMU Cortex-M devices
  - `devices-qemu-riscv` - the QEMU RISC-V devices
- `platforms/` - the board support (currently empty)

New ports should follow the same naming convention, and be added to the folder
of their category.
