/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/server/**/__tests__/**/*.test.ts',
    '<rootDir>/backend/__tests__/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/dist/'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        moduleResolution: 'node',
        allowJs: true,
        esModuleInterop: true
      }
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@scure|otplib|@otplib)/)'
  ]
};
