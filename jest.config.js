/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['<rootDir>/BleDeviceMonitor/'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};
