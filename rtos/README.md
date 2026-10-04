# rtos

This folder holds the µOS++ RTOS source code libraries, included as Git
submodules:

- `cmsis-os` - the CMSIS RTOS compatibility layer, on top of the µOS++ RTOS
- `rtos` - the µOS++ RTOS kernel
- `ports/` - the architecture specific scheduler ports:
  - `rtos-port-cortexm` - Arm Cortex-M
  - `rtos-port-synthetic-posix` - synthetic architecture, running as a POSIX
    process on the development machine
  - `rtos-port-aarch32` - Arm AArch32 (future)
  - `rtos-port-aarch64` - Arm AArch64 (future)
  - `rtos-port-riscv` - RISC-V (future)

The future ports are empty folders, kept with a `.gitkeep` file, until their
repositories are created.

The RTOS is optional; bare-metal applications do not need anything from this
folder.
