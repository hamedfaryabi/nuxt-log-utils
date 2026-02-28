import { describe, it, expect } from 'vitest'
import { resolveConfig } from '../../src/runtime/utils/resolveConfig'
import { LogLevel } from '../../src/runtime/types'

describe('resolveConfig', () => {
  const baseConfig = {
    minLevel: LogLevel.DEBUG,
    output: ['console' as const],
    includeMeta: true,
  }

  it('returns global config when no level override exists', () => {
    const result = resolveConfig(baseConfig, undefined, LogLevel.INFO)
    expect(result.output).toEqual(['console'])
  })

  it('merges level override on top of global config', () => {
    const config = {
      ...baseConfig,
      levels: {
        [LogLevel.ERROR]: { output: ['file' as const] },
      },
    }
    const result = resolveConfig(config, undefined, LogLevel.ERROR)
    expect(result.output).toEqual(['file'])
  })

  it('level override keeps global fields not overridden', () => {
    const config = {
      ...baseConfig,
      filePath: 'logs/app.log',
      levels: {
        [LogLevel.ERROR]: { output: ['file' as const] },
      },
    }
    const result = resolveConfig(config, undefined, LogLevel.ERROR)
    expect(result.filePath).toBe('logs/app.log')
  })

  it('returns global config for level with no override', () => {
    const config = {
      ...baseConfig,
      levels: {
        [LogLevel.ERROR]: { output: ['file' as const] },
      },
    }
    const result = resolveConfig(config, undefined, LogLevel.DEBUG)
    expect(result.output).toEqual(['console'])
  })
})
