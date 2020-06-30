const TEST_REGEX = '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?)$';
process.env.NO_LOG = 'true';

module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testRegex: TEST_REGEX,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'babel-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/client/build/',
    '<rootDir>/src/client/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node', 'tsx', 'jsx'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['.interface.ts', '.data.ts', '.enums.ts'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/client/__mocks__/fileMock.ts',
    '\\.(css|scss|less)$': '<rootDir>/client/__mocks__/styleMock.ts',
  },
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
    },
  },
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 50,
      lines: 80,
    },
  },
  coverageReporters: ['html', 'text', 'text-summary'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
