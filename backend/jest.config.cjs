module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/loadEnv.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: ['js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/socket.js'],
};