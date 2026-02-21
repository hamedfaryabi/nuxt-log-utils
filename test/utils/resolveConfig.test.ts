import { describe, it, expect } from 'vitest'
import { resolveConfig } from '../../modules/logger/runtime/utils/resolveConfig'
import { LogLevel } from '../../modules/logger/runtime/types'

describe('resolveConfig', () => {
  const baseConfig = {
    minLevel: LogLevel.DEBUG,
    output: ['console' as const],
    includeMeta: true,
  }

  it('returns global config when no level override exists', () => {
    const result = resolveConfig(baseConfig, LogLevel.INFO)
    expect(result.output).toEqual(['console'])
  })

  it('merges level override on top of global config', () => {
    const config = {
      ...baseConfig,
      levels: {
        ERROR: { output: ['file' as const] },
      },
    }
    const result = resolveConfig(config, LogLevel.ERROR)
    expect(result.output).toEqual(['file'])
  })

  it('level override keeps global fields not overridden', () => {
    const config = {
      ...baseConfig,
      filePath: 'logs/app.log',
      levels: {
        ERROR: { output: ['file' as const] },
      },
    }
    const result = resolveConfig(config, LogLevel.ERROR)
    expect(result.filePath).toBe('logs/app.log')
  })

  it('returns global config for level with no override', () => {
    const config = {
      ...baseConfig,
      levels: {
        ERROR: { output: ['file' as const] },
      },
    }
    const result = resolveConfig(config, LogLevel.DEBUG)
    expect(result.output).toEqual(['console'])
  })
})
