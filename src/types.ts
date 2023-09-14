export type SystemInfoValue<T> = { title: string; value: T }

export interface SystemInfo {
  core_version: SystemInfoValue<string>
  python_version: SystemInfoValue<string>
  system: SystemInfoValue<string>
  platform: SystemInfoValue<string>
  filesystem_encoding: SystemInfoValue<string>
  locale_encoding: SystemInfoValue<string>
  core_dir: SystemInfoValue<string>
  platformio_exe: SystemInfoValue<string>
  python_exe: SystemInfoValue<string>
  global_lib_nums: SystemInfoValue<number>
  dev_platform_nums: SystemInfoValue<number>
  package_tool_nums: SystemInfoValue<number>
}

export interface Board {
  connectivity: string[]
  debug: {
    tools: Record<string, unknown>
  }
  fcpu: number
  frameworks: string[]
  id: string
  mcu: string
  name: string
  platform: string
  ram: number
  rom: number
  url: string
  vendor: string
}

export interface Device {
  port: string
  description: string
  hwid: string
}

export interface RunTarget {
  name: string
  title: string
  description: string | null
  group: string
}

export interface ProjectMetadata {
  [environment: string]: {
    build_type: string
    env_name: string
    libsource_dirs: string[]
    defines: string[]
    includes: string[]
    cc_flags: string[]
    cxx_flags: string[]
    cc_path: string
    cxx_path: string
    gdb_path: string
    prog_path: string
    svd_path: string | null
    compiler_type: string
    targets: RunTarget[]
    extra: any
  }
}
