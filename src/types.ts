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
