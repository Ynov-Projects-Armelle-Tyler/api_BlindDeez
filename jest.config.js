const path = require('path');

const dotenv = require('dotenv');

dotenv.config({ path: path.resolve('.test.env') });

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  timers: 'real',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'core\\/languages\\/(.+)\\/',
    'services/general/Demo.js',
    'core/views',
    'tests',
    '^.+\\.html',
  ],
  coverageReporters: [
    'lcov',
    'text-summary',
  ],
  globals: {
    __DEV__: false,
  },
  moduleDirectories: [
    './core',
    './services',
    'node_modules',
  ],
  moduleNameMapper: {
    '@blinddeez/api-core$': '<rootDir>/core',
    '@blinddeez/api-core/(.+)$': '<rootDir>/core/$1',
    '@blinddeez/api-(.+)$': '<rootDir>/services/$1',
  },
  preset: '@shelf/jest-mongodb',
  rootDir: './',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
