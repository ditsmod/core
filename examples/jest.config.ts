import type { Config } from 'jest';

const config: Config = {
  transform: {},
  moduleFileExtensions: ['js'],
  testEnvironment: 'node',
  modulePathIgnorePatterns: [],
  moduleNameMapper: {
    '@ditsmod/core': '<rootDir>/../packages/core/src',
    '@ditsmod/cors': '<rootDir>/../packages/cors/src',
    '@ditsmod/return': '<rootDir>/../packages/return/src',
    '@ditsmod/router': '<rootDir>/../packages/router/src',
    '@ditsmod/body-parser': '<rootDir>/../packages/body-parser/src',
    '@ditsmod/session-cookie': '<rootDir>/../packages/session-cookie/src',
    '@ditsmod/openapi-validation': '<rootDir>/../packages/openapi-validation/src',
    '@ditsmod/openapi': '<rootDir>/../packages/openapi/src',
    '@ditsmod/testing': '<rootDir>/../packages/testing/src',
    '@ditsmod/jwt': '<rootDir>/../packages/jwt/src',
    '@ditsmod/i18n': '<rootDir>/../packages/i18n/src',
    '@dict/first/first.dict': '<rootDir>/15-i18n/src/app/first/locales/current/_base-en/first.dict',
    '@dict/second/second.dict': '<rootDir>/15-i18n/src/app/second/locales/current/_base-en/second.dict',
    '@dict/second/errors.dict': '<rootDir>/15-i18n/src/app/second/locales/current/_base-en/errors.dict',
  },
  projects: ['<rootDir>/*/jest.config.ts'],
};

export default config;
