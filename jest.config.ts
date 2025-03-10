import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  maxWorkers: 1, // seem to run out of memory with 4 gigs if run parallel
  transformIgnorePatterns: ['/node_modules/'],
};

export default config;
